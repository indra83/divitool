package co.in.divi.tool.validation;

/*
 * Data model class for assessment.json
 * Doubles as the model for Assessment Node too!
 */
public class AssessmentFileModel {

	public String		id;
	public String		name;
	public String		type;
	public String		time;
	public String		difficulty;
	public String[]		recommendedReadings;

	public Question[]	questions;

	// computed for easy insertion to db
	public String		content;

	public static class Question {
		public String	id;
		public String	name;
		public String	type;
		public int		points	= 1;
	}
}
