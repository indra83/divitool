package co.in.divi.tool.ui;

import java.awt.BorderLayout;
import java.awt.GridLayout;
import java.awt.TextArea;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

import javax.swing.JButton;
import javax.swing.JPanel;
import javax.swing.SwingWorker;

import net.lingala.zip4j.core.ZipFile;
import net.lingala.zip4j.model.ZipParameters;
import net.lingala.zip4j.util.Zip4jConstants;
import co.in.divi.tool.ToolServer;
import co.in.divi.tool.validation.ValidationWorker;

public class ValidationPanel extends JPanel {

	ToolServer		mainPanel;

	JButton			validateButton, zipButton;
	TextArea		logArea;

	ArrayList<File>	toDelete;

	public ValidationPanel(ToolServer mainPanel) {
		super(new BorderLayout(25, 25));
		this.mainPanel = mainPanel;

		JPanel gridPanel = new JPanel(new GridLayout(3, 1, 5, 5));
		validateButton = new JButton("Validate Book");
		validateButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent arg0) {
				validateButton.setEnabled(false);
				toDelete = new ArrayList<File>();
				new ValidationWorker(logArea, toDelete).execute();
			}
		});
		gridPanel.add(validateButton);

		logArea = new TextArea();

		zipButton = new JButton("Create Book Update");
		// zipButton.setEnabled(false);
		zipButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent arg0) {
				zipButton.setEnabled(false);
				new ZipWorker().execute();
			}
		});

		add(validateButton, BorderLayout.NORTH);
		add(logArea, BorderLayout.CENTER);
		add(zipButton, BorderLayout.SOUTH);
	}

	private class ZipWorker extends SwingWorker<Integer, String> {

		public ZipWorker() {
			logArea.append("\n\n");
		}

		@Override
		protected Integer doInBackground() throws Exception {
			File bookDir = ToolServer.getBooksDir();
			publish("Starting zip of - " + bookDir.getAbsolutePath());
			File archiveFile = new File(bookDir.getParentFile(), "book_" + System.currentTimeMillis() / 1000 + ".zip");
			publish("Saving to - " + archiveFile.getAbsolutePath());
			ZipFile zipFile = new ZipFile(archiveFile);
			ZipParameters parameters = new ZipParameters();
			parameters.setCompressionMethod(Zip4jConstants.COMP_STORE);

			for (File f : bookDir.listFiles()) {
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
