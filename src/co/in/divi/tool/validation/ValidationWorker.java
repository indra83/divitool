package co.in.divi.tool.validation;

import java.awt.TextArea;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.security.AlgorithmParameters;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ExecutionException;

import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.PBEParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.swing.JOptionPane;
import javax.swing.SwingWorker;

import co.in.divi.tool.ToolServer;
import co.in.divi.tool.validation.BookDefinition.AssessmentDefinition;
import co.in.divi.tool.validation.BookDefinition.ChapterDefinition;
import co.in.divi.tool.validation.BookDefinition.TopicDefinition;

import com.google.gson.Gson;

public class ValidationWorker extends SwingWorker<Integer, String> {

	TextArea					logArea;
	ArrayList<File>				toDelete;

	Gson						gson;

	public ValidationWorker(TextArea logArea, ArrayList<File> toDelete) {
		this.logArea = logArea;
		this.toDelete = toDelete;
		gson = new Gson();
	}

	@Override
	protected Integer doInBackground() throws Exception {
		File bookDir = ToolServer.getBooksDir();
		publish("Reading book at - " + bookDir.getAbsolutePath());
		// Validate master.json
		File bookDefFile = new File(bookDir, Util.BOOK_DEFINITION_FILE_NAME);
		try {
			BookDefinition bookDef = gson.fromJson(Util.openJSONFile(bookDefFile), BookDefinition.class);
			publish("Begin validation of " + bookDef.name);
			HashSet<String> chapterIds = new HashSet<String>();
			for (ChapterDefinition chDef : bookDef.chapters) {
				if (chapterIds.contains(chDef.id)) {
					publish("!!Duplicate chapter found! - " + chDef.id);
					return 1;
				}
				chapterIds.add(chDef.id);
			}
			// find extra chapters & files (root dir)
			for (File f : bookDir.listFiles()) {
				if (f.isDirectory()) {
					if (!chapterIds.contains(f.getName())) {
						toDelete.add(f);
						publish("Delete folder - " + bookDir.toURI().relativize(f.toURI()).getPath());
					}
				} else {
					if (!f.getName().equals(Util.BOOK_DEFINITION_FILE_NAME)) {
						toDelete.add(f);
						publish("Delete file - " + f.getName());
					}
				}
			}

			HashSet<String> allIds = new HashSet<String>();
			for (ChapterDefinition chDef : bookDef.chapters) {
				for (TopicDefinition topDef : chDef.topics) {
					if (allIds.contains(topDef.id)) {
						publish("Duplicate topicId found! - " + topDef.id);
						return 1;
					}
					allIds.add(topDef.id);
				}
				for (AssessmentDefinition assDef : chDef.assessments) {
					if (allIds.contains(assDef.id)) {
						publish("Duplicate assessment Id found! - " + assDef.id);
						return 1;
					}
					allIds.add(assDef.id);
				}
			}
			publish("Passed id uniqueness test!");

			int ret = 0;
			// Validate each chapter
			for (ChapterDefinition chDef : bookDef.chapters) {
				ret += validateChapter(bookDir, chDef);
			}

			if (ret == 0) {
				for (File f : toDelete) {
					publish("Delete - " + f.getAbsolutePath());
				}
			}

			return ret;
		} catch (Exception e) {
			publish("Validation failed - " + e);
			// publish(e.getStackTrace());
			return 1;
		}
	}

	@Override
	protected void process(List<String> chunks) {
		for (String message : chunks) {
			logArea.append(message);
			logArea.append("\n");
		}
	}

	@Override
	protected void done() {
		try {
			if (get() == 0) {
				if (toDelete.size() > 0) {
					int n = JOptionPane.showConfirmDialog(null, "Are you sure you want to delete " + toDelete.size() + " file(s)?",
							"Delete unused files", JOptionPane.YES_NO_OPTION);
					if (n == JOptionPane.YES_OPTION) {
						boolean deleteSuccessful = true;
						for (File f : toDelete)
							deleteSuccessful = deleteSuccessful && f.delete();
						if (deleteSuccessful)
							logArea.append("Deleted files\n");
						else
							logArea.append("!!!Delete failed\n");
					} else {
						// do nothing
						logArea.append("!!!There are unused files in book\n");
						return;
					}
				}
				logArea.append("Validation successuful!\n\n");
				return;
			}
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		logArea.append("Validation failed!\n\n");
	}

	private int validateChapter(File bookDir, ChapterDefinition chDef) {
		publish("Validating chapter - " + chDef.id);
		publish("     - " + chDef.name);
		HashSet<String> topicIds = new HashSet<String>();
		for (TopicDefinition topDef : chDef.topics) {
			topicIds.add(topDef.id);
		}
		for (AssessmentDefinition assDef : chDef.assessments) {
			topicIds.add(assDef.id);
		}
		File chDir = new File(bookDir, chDef.id);

		if (!chDir.exists()) {
			publish("!!Chapter directory missing - " + chDir.getName());
			return 1;
		}
		for (File f : chDir.listFiles()) {
			if (!(f.isDirectory() && topicIds.contains(f.getName()))) {
				toDelete.add(f);
				publish("Delete file - " + f.getName());
			}
		}
		int ret = 0;
		for (TopicDefinition topDef : chDef.topics) {
			ret += validateTopic(chDir, topDef);
		}

		for (AssessmentDefinition assDef : chDef.assessments) {
			ret += validateAssessment(chDir, assDef);
		}
		return ret;
	}

	private int validateTopic(File chDir, TopicDefinition topDef) {
		StringBuilder sb = new StringBuilder();
		try {
			File topDir = new File(chDir, topDef.id);
			if (!topDir.exists()) {
				publish("!!Topic directory missing - " + topDir.getName());
				return 1;
			}
			File topicXmlFile = new File(topDir, "topic.xml");
			if (!topicXmlFile.exists()) {
				publish("!!Topic file missing - " + topicXmlFile.getName());
				return 1;
			}

			ArrayList<File> refFiles = new ArrayList<File>();
			refFiles.add(topicXmlFile);
			new TopicXmlValidator().validateTopic(topicXmlFile, sb, refFiles);
			HashSet<String> refFilePaths = new HashSet<String>();
			HashSet<String> existingFiles = new HashSet<String>();
			for (File f : refFiles)
				refFilePaths.add(f.getCanonicalPath());
			for (File f : topicXmlFile.getParentFile().listFiles()) {
				if (f.isDirectory()) {
					for (File f2 : f.listFiles()) {
						existingFiles.add(f2.getCanonicalPath());
					}
				} else {
					existingFiles.add(f.getCanonicalPath());
				}
			}

			for (String path : refFilePaths) {
				if (!existingFiles.contains(path)) {
					publish("Referenced file missing! - 	" + path);
					return 1;
				}
			}

			for (String path : existingFiles) {
				if (!refFilePaths.contains(path)) {
					toDelete.add(new File(path));
				}
			}

		} catch (Exception e) {
			publish(sb.toString());
			e.printStackTrace();
			return 1;
		}

		return 0;
	}

	private int validateAssessment(File chDir, AssessmentDefinition assDef) {
		File assDir = new File(chDir, assDef.id);
		if (!assDir.exists()) {
			publish("!!Assessment directory missing - " + assDir.getName());
			return 1;
		}
		File assDefFile = new File(assDir, "assessments.json");
		if (!assDefFile.exists()) {
			publish("!!Assessment def missing - " + assDefFile.getName());
			return 1;
		}
		AssessmentFileModel assFileDef = new Gson().fromJson(Util.openJSONFile(assDefFile), AssessmentFileModel.class);
		HashSet<String> qIds = new HashSet<String>();
		qIds.add(assDefFile.getName());
		for (AssessmentFileModel.Question q : assFileDef.questions) {
			qIds.add(q.id);
			File questionFile = new File(new File(assDir, q.id), "question.xml");
			if (!questionFile.exists()) {
				publish("Missing question - " + questionFile.getAbsolutePath());
				return 1;
			}
			// TODO: validate question xml
		}

		for (File f : assDir.listFiles()) {
			if (!qIds.contains(f.getName())) {
				toDelete.add(f);
				publish("Unused question dir found, deleting - " + f.getAbsolutePath());
			}
		}

		return 0;
	}
}
