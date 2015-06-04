package co.in.divi.tool.ui;

import java.awt.BorderLayout;
import java.awt.Checkbox;
import java.awt.GridLayout;
import java.awt.Label;
import java.awt.TextArea;
import java.awt.TextField;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.nio.file.CopyOption;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.spec.KeySpec;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;

import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import javax.swing.JButton;
import javax.swing.JPanel;
import javax.swing.SwingWorker;

import org.apache.commons.io.FileUtils;

import com.google.gson.Gson;

import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.model.ZipParameters;
import net.lingala.zip4j.util.Zip4jConstants;
import co.in.divi.tool.ToolServer;
import co.in.divi.tool.validation.AssessmentFileModel;
import co.in.divi.tool.validation.BookDefinition;
import co.in.divi.tool.validation.Util;
import co.in.divi.tool.validation.ValidationWorker;
import co.in.divi.tool.validation.BookDefinition.AssessmentDefinition;
import co.in.divi.tool.validation.BookDefinition.ChapterDefinition;
import co.in.divi.tool.validation.BookDefinition.TopicDefinition;

public class ValidationPanel extends JPanel {

	ToolServer mainPanel;

	JButton validateButton, zipButton;
	TextArea logArea;
	Checkbox excludeVideosCb;
	TextField encPasswordText;

	ArrayList<File> toDelete;

	public ValidationPanel(ToolServer mainPanel) {
		super(new BorderLayout(25, 25));
		this.mainPanel = mainPanel;

		validateButton = new JButton("Validate Book");
		validateButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent arg0) {
				validateButton.setEnabled(false);
				toDelete = new ArrayList<File>();
				new ValidationWorker(logArea, toDelete).execute();
			}
		});

		logArea = new TextArea();

		JPanel zipGridPanel = new JPanel(new GridLayout(2, 2, 5, 5));
		excludeVideosCb = new Checkbox("Exclude Videos");
		encPasswordText = new TextField();
		zipButton = new JButton("Create Book Update");
		// zipButton.setEnabled(false);
		zipButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent arg0) {
				zipButton.setEnabled(false);
				new ZipWorker(excludeVideosCb.getState(), encPasswordText
						.getText()).execute();
			}
		});

		add(validateButton, BorderLayout.NORTH);
		add(logArea, BorderLayout.CENTER);

		zipGridPanel.add(new Label("Encryption Passphrase"));
		zipGridPanel.add(encPasswordText);
		zipGridPanel.add(excludeVideosCb);
		zipGridPanel.add(zipButton);
		add(zipGridPanel, BorderLayout.SOUTH);
	}

	private class ZipWorker extends SwingWorker<Integer, String> {
		private boolean excludeVideos;
		private String passPhrase;

		public ZipWorker(boolean excludeVideos, String passPhrase) {
			this.excludeVideos = excludeVideos;
			this.passPhrase = passPhrase;
			logArea.append("\n\n");
		}

		@Override
		protected Integer doInBackground() {
			try {
				File bookOriginalDir = ToolServer.getBooksDir();
				StringBuilder archiveFileName = new StringBuilder("book_");
				File stagingDir = new File(bookOriginalDir.getParentFile(),
						"tmp_" + bookOriginalDir.getName());
				if (stagingDir.exists())
					stagingDir.delete();
				FileUtils.copyDirectory(bookOriginalDir, stagingDir);
				// Encryption
				if (passPhrase != null && passPhrase.length() > 0) {
					publish("Encrypting with - " + passPhrase);
					archiveFileName.append("enc_");
					byte[] salt = new byte[8];
					byte[] saltGen = "DiviLearningSolutionsPrivateLimited"
							.getBytes("UTF-8");
					for (int i = 0; i < 8; i++) {
						salt[i] = saltGen[i];
					}
					SecretKeyFactory factory = SecretKeyFactory
							.getInstance("PBKDF2WithHmacSHA1");
					KeySpec spec = new PBEKeySpec(passPhrase.toCharArray(),
							salt, 65536, 128);
					SecretKey tmp = factory.generateSecret(spec);
					SecretKey secret = new SecretKeySpec(tmp.getEncoded(),
							"AES");

					File bookDefFile = new File(stagingDir,
							Util.BOOK_DEFINITION_FILE_NAME);
					BookDefinition bookDef = new Gson().fromJson(
							Util.openJSONFile(bookDefFile),
							BookDefinition.class);
					for (ChapterDefinition chDef : bookDef.chapters) {
						File chDir = new File(stagingDir, chDef.id);
						for (TopicDefinition topDef : chDef.topics) {
							File topDir = new File(chDir, topDef.id);
							File topicXmlFile = new File(topDir, "topic.xml");
							Util.encryptFile(topicXmlFile, secret);
//							Util.decryptFile(topicXmlFile, secret);
							if (excludeVideos) {
								for (File f : topDir.listFiles()) {
									if (f.isFile()
											&& (f.getName().endsWith("mp4") || f
													.getName().endsWith("MP4"))) {
										publish("Deleting video - " + f);
										f.delete();
									}
								}
							}
						}
						for (AssessmentDefinition assDef : chDef.assessments) {
							File assDir = new File(chDir, assDef.id);
							File assDefFile = new File(assDir,
									"assessments.json");
							AssessmentFileModel assFileDef = new Gson()
									.fromJson(Util.openJSONFile(assDefFile),
											AssessmentFileModel.class);
							for (AssessmentFileModel.Question q : assFileDef.questions) {
								File questionFile = new File(new File(assDir,
										q.id), "question.xml");
								Util.encryptFile(questionFile, secret);
//								Util.decryptFile(questionFile, secret);
							}
						}
					}
				}
				publish("Starting zip of - " + stagingDir.getAbsolutePath());
				if (excludeVideos)
					archiveFileName.append("novid_");
				archiveFileName.append(System.currentTimeMillis() / 1000);
				archiveFileName.append(".zip");
				File archiveFile = new File(stagingDir.getParentFile(),
						archiveFileName.toString());
				publish("Saving to - " + archiveFile.getAbsolutePath());
				ZipFile zipFile = new ZipFile(archiveFile);
				ZipParameters parameters = new ZipParameters();
				parameters.setCompressionMethod(Zip4jConstants.COMP_DEFLATE);
				parameters
						.setCompressionLevel(Zip4jConstants.DEFLATE_LEVEL_FASTEST);

				for (File f : stagingDir.listFiles()) {
					if (f.isDirectory()) {
						publish("Adding folder - " + f.getName());
						zipFile.addFolder(f, parameters);
					} else {
						publish("Adding file - " + f.getName());
						zipFile.addFile(f, parameters);
					}
				}
				publish("Done!");
				return 0;
			} catch (Exception e) {
				e.printStackTrace();
				publish("Error - " + e.getMessage());
				return 1;
			}
		}

		@Override
		protected void process(List<String> messages) {
			for (String message : messages) {
				logArea.append(message);
				logArea.append("\n");
			}
		}

	}
}
