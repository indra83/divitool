package co.in.divi.tool.validation;

import java.util.ArrayList;


/*
 * Data model class for master.json
 */
public class BookDefinition {

	public String				bookId;
	public String				courseId;
	public String				name;
	public int					version;
	public int					orderNo;

	public ChapterDefinition[]	chapters;

	public static class ChapterDefinition {
		public String							id;
		public String							name;

		public TopicDefinition[]				topics;
		public AssessmentDefinition[]			assessments;

		public ArrayList<TopicNode>				topicNodes;		// computed for loading to db
		public ArrayList<AssessmentFileModel>	assessmentNodes;	// computed for loading to db
	}

	public static class TopicDefinition {
		public String	id;
		public String	name;
	}

	public static class AssessmentDefinition {
		public String	id;
		public String	name;
		public String	type;
		public String	time;
		public String	difficulty;
	}

	// for import to db
	public static class TopicNode {
		public String	id;
		public String	name;
		public String	content;	// JSON for TOC
	}
}
