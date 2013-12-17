package co.in.divi.tool;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;
import org.xmlpull.v1.XmlPullParserFactory;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;

public class TopicHTMLGenerator {
	private static final boolean	DEBUG			= true;
	private static final String		TAG				= "TopicHTMLGenerator";
	private static final String		ns				= null;
	private static final String		TEMPLATE_PATH	= "bookdesign/templates/";
	String							basePath;

	static Template					topicContentTemplate, chapterTemplate, topicTitleTemplace, subTopicTitleTemplate, textTemplate,
			imageTemplate, imageNoBorderTemplate, videoTemplate, audioTemplate, box1Template;

	public TopicHTMLGenerator(String basePath) {
		this.basePath = basePath;
		System.out.println(basePath);
		if (topicContentTemplate == null) {// lazy initialize once.
			topicContentTemplate = Mustache.compiler().compile(getTemplateText("topic_content.txt"));
			chapterTemplate = Mustache.compiler().compile(getTemplateText("chapter.txt"));
			topicTitleTemplace = Mustache.compiler().compile(getTemplateText("topic_title.txt"));
			subTopicTitleTemplate = Mustache.compiler().compile(getTemplateText("subtopic.txt"));
			textTemplate = Mustache.compiler().compile(getTemplateText("text.txt"));
			box1Template = Mustache.compiler().compile(getTemplateText("box1.txt"));
			imageTemplate = Mustache.compiler().compile(getTemplateText("image.txt"));
			imageNoBorderTemplate = Mustache.compiler().compile(getTemplateText("image_noborder.txt"));
			videoTemplate = Mustache.compiler().compile(getTemplateText("video.txt"));
			audioTemplate = Mustache.compiler().compile(getTemplateText("audio.txt"));
		}
	}

	public String getTopicHTML(File topicXmlFile, final String chapterTitle, final String chapterAuthor, final String topicTitle) {
		if (DEBUG)
			System.out.println("processing file: " + topicXmlFile.getAbsolutePath());
		final StringBuilder contentBuilder = new StringBuilder();
		if (chapterTitle != null) {
			contentBuilder.append(chapterTemplate.execute(new Object() {
				String	title	= chapterTitle;
				String	author	= chapterAuthor;
			}));
		}
		contentBuilder.append(topicTitleTemplace.execute(new Object() {
			String	title	= topicTitle;
		}));
		try {
			XmlPullParserFactory factory = XmlPullParserFactory.newInstance();
			factory.setNamespaceAware(false);
			XmlPullParser parser = factory.newPullParser();
			parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, false);
			parser.setInput(new StringReader(getInputString(new FileInputStream(topicXmlFile))));
			nextTag(parser);
			parser.require(XmlPullParser.START_TAG, ns, "topic");

			while (parser.next() != XmlPullParser.END_TAG) {// topic end tag
				if (parser.getEventType() != XmlPullParser.START_TAG) {
					continue;
				}
				String name = parser.getName();
				System.out.println(name);
				// Starts by looking for the entry tag
				if (name.equals(TopicXmlTags.SUBTOPIC_TAG)) {
					processSubtopic(parser, contentBuilder);
				} else if (name.equals(TopicXmlTags.SUBHEADER_TAG)) {
					// TODO:
					skip(parser);
				} else if (name.equals(TopicXmlTags.IMAGE_TAG)) {
					processImage(parser, contentBuilder);
				} else if (name.equals(TopicXmlTags.VIDEO_TAG)) {
					processVideo(parser, contentBuilder);
				} else if (name.equals(TopicXmlTags.AUDIO_TAG)) {
					processAudio(parser, contentBuilder);
				} else if (name.equals(TopicXmlTags.HTML_TAG)) {
					processHtml(parser, contentBuilder);
				} else {
					skip(parser);
				}
			}
		} catch (XmlPullParserException xppe) {
			System.out.println("error parsing topic xml" + xppe);
		} catch (FileNotFoundException e) {
			System.out.println("error reading topic xml" + e);
		} catch (IOException e) {
			System.out.println("error reading topic xml" + e);
		}
		// System.out.println(contentBuilder.toString());
		String ret = topicContentTemplate.execute(new Object() {
			String	content	= contentBuilder.toString();
		});
		if (DEBUG)
			System.out.println(ret);
		return ret;
	}

	private void processImage(XmlPullParser parser, StringBuilder sb) throws IOException, XmlPullParserException {
		parser.require(XmlPullParser.START_TAG, ns, TopicXmlTags.IMAGE_TAG);
		final String _id = parser.getAttributeValue(ns, TopicXmlTags.ID_ATTRIBUTE);
		final String imageSrc = basePath + parser.getAttributeValue(ns, TopicXmlTags.SRC_ATTRIBUTE);
		final String showBorder = parser.getAttributeValue(ns, TopicXmlTags.IMAGE_SHOWBORDER_ATTRIBUTE);
		String tempImageDesc = null;
		String tempImageTitle = null;
		while (parser.next() != XmlPullParser.END_TAG) {// image end tag
			if (parser.getEventType() != XmlPullParser.START_TAG) {
				continue;
			}
			String name = parser.getName();
			// Starts by looking for the entry tag
			if (name.equals(TopicXmlTags.IMAGE_DESCRIPTION_TAG)) {
				tempImageDesc = readText(parser);
			} else if (name.equals(TopicXmlTags.IMAGE_TITLE_TAG)) {
				tempImageTitle = readText(parser);
			} else {
				skip(parser);
			}
		}
		final String imageDesc = tempImageDesc;
		final String imageTitle = tempImageTitle;
		parser.require(XmlPullParser.END_TAG, ns, TopicXmlTags.IMAGE_TAG);
		if (showBorder == null || Boolean.parseBoolean(showBorder)) {
			sb.append(imageTemplate.execute(new Object() {
				String	id			= _id;
				String	image_path	= imageSrc;
				String	caption		= imageTitle;
				String	desc		= imageDesc;
			}));
		} else {
			sb.append(imageNoBorderTemplate.execute(new Object() {
				String	id			= _id;
				String	image_path	= imageSrc;
				String	caption		= imageTitle;
				String	desc		= imageDesc;
			}));
		}
	}

	private void processVideo(XmlPullParser parser, StringBuilder sb) throws IOException, XmlPullParserException {
		parser.require(XmlPullParser.START_TAG, ns, TopicXmlTags.VIDEO_TAG);
		final String _id = parser.getAttributeValue(ns, TopicXmlTags.ID_ATTRIBUTE);
		final String videoThumb = parser.getAttributeValue(ns, TopicXmlTags.VIDEO_THUMB_ATTRIBUTE);
		String tempVideoDesc = null;
		String tempVideoTitle = null;
		while (parser.next() != XmlPullParser.END_TAG) {// topic end tag
			if (parser.getEventType() != XmlPullParser.START_TAG) {
				continue;
			}
			String name = parser.getName();
			// Starts by looking for the entry tag
			if (name.equals(TopicXmlTags.VIDEO_DESCRIPTION_TAG)) {
				tempVideoDesc = readText(parser);
			} else if (name.equals(TopicXmlTags.VIDEO_TITLE_TAG)) {
				tempVideoTitle = readText(parser);
			} else {
				skip(parser);
			}
		}
		final String videoDesc = tempVideoDesc;
		final String videoTitle = tempVideoTitle;
		parser.require(XmlPullParser.END_TAG, ns, TopicXmlTags.VIDEO_TAG);
		sb.append(videoTemplate.execute(new Object() {
			String	id				= _id;
			String	thumbnail_path	= basePath + videoThumb;
			String	caption			= videoTitle;
		}));
	}

	private void processAudio(XmlPullParser parser, StringBuilder sb) throws IOException, XmlPullParserException {
		parser.require(XmlPullParser.START_TAG, ns, TopicXmlTags.AUDIO_TAG);
		final String _id = parser.getAttributeValue(ns, TopicXmlTags.ID_ATTRIBUTE);
		String tempAudioDesc = null;
		String tempAudioTitle = "";
		while (parser.next() != XmlPullParser.END_TAG) {// topic end tag
			if (parser.getEventType() != XmlPullParser.START_TAG) {
				continue;
			}
			String name = parser.getName();
			// Starts by looking for the entry tag
			if (name.equals(TopicXmlTags.AUDIO_DESCRIPTION_TAG)) {
				tempAudioDesc = readText(parser);
			} else if (name.equals(TopicXmlTags.AUDIO_TITLE_TAG)) {
				tempAudioTitle = readText(parser);
			} else {
				skip(parser);
			}
		}
		final String audioDesc = tempAudioDesc;
		final String audioTitle = tempAudioTitle;
		parser.require(XmlPullParser.END_TAG, ns, TopicXmlTags.AUDIO_TAG);
		sb.append(audioTemplate.execute(new Object() {
			String	id		= _id;
			String	title	= audioTitle;
			String	desc	= audioDesc;
		}));
	}

	private void processHtml(XmlPullParser parser, StringBuilder sb) throws IOException, XmlPullParserException {
		parser.require(XmlPullParser.START_TAG, ns, TopicXmlTags.HTML_TAG);
		final String boxType = parser.getAttributeValue(ns, TopicXmlTags.HTML_BOXTYPE_ATTRIBUTE);
		final String boxTitle = parser.getAttributeValue(ns, TopicXmlTags.HTML_BOXTITLE_ATTRIBUTE);
		String tempData = null;
		while (parser.next() != XmlPullParser.END_TAG) {// topic end tag
			if (parser.getEventType() != XmlPullParser.START_TAG) {
				continue;
			}
			String name = parser.getName();
			// Starts by looking for the entry tag
			if (name.equals(TopicXmlTags.HTML_DATA_TAG)) {
				// get to cdata tag:
				tempData = readText(parser);
			} else {
				skip(parser);
			}
		}
		final String data = StringEscapeUtils.unescapeXml(tempData);
		parser.require(XmlPullParser.END_TAG, ns, TopicXmlTags.HTML_TAG);
		if (StringUtils.isEmpty(boxType) || boxType.equalsIgnoreCase(TopicXmlTags.HTML_BOXTYPE_NONE) || boxType.equalsIgnoreCase("null")) {
			sb.append(textTemplate.execute(new Object() {
				String	content	= data;
			}));
		} else if (boxType.equalsIgnoreCase(TopicXmlTags.HTML_BOXTYPE_INFO)) {
			sb.append(box1Template.execute(new Object() {
				String	title	= boxTitle;
				String	content	= data;
			}));
		}
	}

	private void processSubtopic(XmlPullParser parser, StringBuilder sb) throws IOException, XmlPullParserException {
		parser.require(XmlPullParser.START_TAG, ns, TopicXmlTags.SUBTOPIC_TAG);
		final String _id = parser.getAttributeValue(ns, TopicXmlTags.ID_ATTRIBUTE);
		final String subheading = readText(parser);
		parser.require(XmlPullParser.END_TAG, ns, TopicXmlTags.SUBTOPIC_TAG);
		sb.append(subTopicTitleTemplate.execute(new Object() {
			String	id		= _id;
			String	title	= subheading;
		}));
	}

	private String readText(XmlPullParser parser) throws IOException, XmlPullParserException {
		String result = "";
		if (parser.next() == XmlPullParser.TEXT) {
			result = parser.getText();
			nextTag(parser);
		}
		return result;
	}

	private void skip(XmlPullParser parser) throws XmlPullParserException, IOException {
		if (parser.getEventType() != XmlPullParser.START_TAG) {
			throw new IllegalStateException();
		}
		int depth = 1;
		while (depth != 0) {
			switch (parser.next()) {
			case XmlPullParser.END_TAG:
				depth--;
				break;
			case XmlPullParser.START_TAG:
				depth++;
				break;
			}
		}
	}

	private int nextTag(XmlPullParser parser) throws XmlPullParserException, IOException {
		int eventType = parser.next();
		if (eventType == XmlPullParser.TEXT && parser.isWhitespace()) { // skip whitespace
			eventType = parser.next();
		}
		if (eventType != XmlPullParser.START_TAG && eventType != XmlPullParser.END_TAG) {
			throw new RuntimeException("expected start or end tag");
		}
		return eventType;
	}

	private static String getTemplateText(String fileName) {
		try {
			return getInputString(TopicHTMLGenerator.class.getResourceAsStream("/bookdesign/templates/" + fileName));
		} catch (IOException e) {
			System.out.println("error reading template" + e);
		}
		return null;
	}

	public static String getInputString(InputStream is) throws IOException {
		if (is == null)
			return null;
		BufferedReader in = new BufferedReader(new InputStreamReader(is), 8192);
		String line;
		StringBuilder sb = new StringBuilder();

		try {
			while ((line = in.readLine()) != null)
				sb.append(line);
		} finally {
			is.close();
		}
		return sb.toString();
	}
}