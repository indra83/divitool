package co.in.divi.tool.validation;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;

import org.apache.commons.lang3.StringEscapeUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;
import org.xmlpull.v1.XmlPullParserFactory;

public class TopicXmlValidator {
	private static final String	TAG	= "TopicHTMLGenerator";
	private static final String	ns	= null;

	static class Log {
		public static void d(String tag, String msg) {
			// System.out.println(tag);
			System.out.println(msg);
		}
	}

	static class Config {
		public static boolean	DEBUG_XML	= true;
	}

	public int validateTopic(File topicXmlFile, StringBuilder sb, ArrayList<File> referencedFiles) {
		if (Config.DEBUG_XML)
			Log.d(TAG, "processing file: " + topicXmlFile.getAbsolutePath());

		try {
			XmlPullParserFactory factory = XmlPullParserFactory.newInstance();
			factory.setNamespaceAware(false);
			XmlPullParser parser = factory.newPullParser();
			parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, false);
			parser.setInput(new FileInputStream(topicXmlFile), null);
			parser.nextTag();
			parser.require(XmlPullParser.START_TAG, ns, "topic");

			while (parser.next() != XmlPullParser.END_TAG) {// topic end tag
				if (parser.getEventType() != XmlPullParser.START_TAG) {
					continue;
				}
				String name = parser.getName();
				// Starts by looking for the entry tag
				if (name.equals(TopicXmlTags.SUBTOPIC_TAG)) {
					processSubtopic(parser);
				} else if (name.equals(TopicXmlTags.SUBHEADER_TAG)) {
					// TODO:
					skip(parser);
				} else if (name.equals(TopicXmlTags.IMAGE_TAG)) {
					processImage(parser, sb, topicXmlFile, referencedFiles);
				} else if (name.equals(TopicXmlTags.VIDEO_TAG)) {
					processVideo(parser, sb, topicXmlFile, referencedFiles);
				} else if (name.equals(TopicXmlTags.AUDIO_TAG)) {
					processAudio(parser, sb, topicXmlFile, referencedFiles);
				} else if (name.equals(TopicXmlTags.HTML_TAG)) {
					processHtml(parser, sb, topicXmlFile, referencedFiles);
				} else {
					skip(parser);
				}
			}
			return 0;
		} catch (Exception e) {
			sb.append("Error parsing topic xml - " + e.getMessage());
			return 1;
		}
	}

	private void processImage(XmlPullParser parser, StringBuilder sb, File topicXmlFile, ArrayList<File> referencedFiles)
			throws IOException, XmlPullParserException {
		parser.require(XmlPullParser.START_TAG, ns, TopicXmlTags.IMAGE_TAG);
		final String _id = parser.getAttributeValue(ns, TopicXmlTags.ID_ATTRIBUTE);
		final String imageSrc = parser.getAttributeValue(ns, TopicXmlTags.SRC_ATTRIBUTE);
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
		referencedFiles.add(new File(topicXmlFile.getParentFile(), imageSrc));
	}

	private void processVideo(XmlPullParser parser, StringBuilder sb, File topicXmlFile, ArrayList<File> referencedFiles)
			throws IOException, XmlPullParserException {
		parser.require(XmlPullParser.START_TAG, ns, TopicXmlTags.VIDEO_TAG);
		final String _id = parser.getAttributeValue(ns, TopicXmlTags.ID_ATTRIBUTE);
		final String videoThumb = parser.getAttributeValue(ns, TopicXmlTags.VIDEO_THUMB_ATTRIBUTE);
		String src = parser.getAttributeValue(ns, TopicXmlTags.SRC_ATTRIBUTE);
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
		referencedFiles.add(new File(topicXmlFile.getParentFile(), videoThumb));
		referencedFiles.add(new File(topicXmlFile.getParentFile(), src));
	}

	private void processAudio(XmlPullParser parser, StringBuilder sb, File topicXmlFile, ArrayList<File> referencedFiles)
			throws IOException, XmlPullParserException {
		parser.require(XmlPullParser.START_TAG, ns, TopicXmlTags.AUDIO_TAG);
		final String _id = parser.getAttributeValue(ns, TopicXmlTags.ID_ATTRIBUTE);
		String src = parser.getAttributeValue(ns, TopicXmlTags.SRC_ATTRIBUTE);
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
		referencedFiles.add(new File(topicXmlFile.getParentFile(), src));
	}

	private void processHtml(XmlPullParser parser, StringBuilder sb, File topicXmlFile, ArrayList<File> referencedFiles)
			throws IOException, XmlPullParserException {
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
		Document doc = Jsoup.parse(data);
		Elements imgs = doc.select("img");
		for (Element img : imgs) {
			if (!img.attr("src").startsWith("data:")) {
				File f = new File(topicXmlFile.getParentFile(), img.attr("src"));
				Log.d(TAG, "tag:" + f.getAbsolutePath());
				referencedFiles.add(f);
			}
		}
	}

	private void processSubtopic(XmlPullParser parser) throws IOException, XmlPullParserException {
		parser.require(XmlPullParser.START_TAG, ns, TopicXmlTags.SUBTOPIC_TAG);
		final String _id = parser.getAttributeValue(ns, TopicXmlTags.ID_ATTRIBUTE);
		final String subheading = readText(parser);
		parser.require(XmlPullParser.END_TAG, ns, TopicXmlTags.SUBTOPIC_TAG);
	}

	private String readText(XmlPullParser parser) throws IOException, XmlPullParserException {
		String result = "";
		if (parser.next() == XmlPullParser.TEXT) {
			result = parser.getText();
			parser.nextTag();
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

}
