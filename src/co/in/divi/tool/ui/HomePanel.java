package co.in.divi.tool.ui;

import java.awt.BorderLayout;
import java.awt.CardLayout;
import java.awt.Desktop;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.net.URI;

import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.SwingWorker;

import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.server.nio.SelectChannelConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;

import co.in.divi.tool.FileUploadServlet;
import co.in.divi.tool.FormulaServlet;
import co.in.divi.tool.PreviewServlet;
import co.in.divi.tool.ToolServer;

public class HomePanel extends JPanel implements ActionListener {

	ToolServer		mainPanel;

	JButton			selectBooksDir;
	JLabel			bookDir;
	JFileChooser	chooser;
	String			choosertitle;

	SwingWorker		worker	= new SwingWorker<Void, Void>() {
								@Override
								public Void doInBackground() {
									try {
										System.out.println("server starting");
										startServer();
										System.out.println("server started");
									} catch (Exception e) {
										System.out.println("error: " + e);
										e.printStackTrace();
									}
									return null;
								}

								@Override
								public void done() {

								}
							};

	public HomePanel(ToolServer toolServer) {
		super(new BorderLayout(25, 25));
		this.mainPanel = toolServer;

		JPanel booksPanel = new JPanel(new GridLayout(3, 1, 5, 5));

		bookDir = new JLabel();
		if (ToolServer.getBooksDir() != null)
			bookDir.setText(ToolServer.getBooksDir().toString());

		booksPanel.add(bookDir);
		selectBooksDir = new JButton("Select book directory");
		selectBooksDir.setSize(100, 50);
		selectBooksDir.addActionListener(this);
		booksPanel.add(selectBooksDir);
		// setup launch button
		JButton launchBrowser = new JButton("Open Editor");
		launchBrowser.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				if (ToolServer.getBooksDir() == null) {
					JOptionPane.showMessageDialog(null, "Please select the book directory");
					return;
				}
				selectBooksDir.setEnabled(false);
				worker.execute();
				try {
					Desktop desktop = Desktop.isDesktopSupported() ? Desktop.getDesktop() : null;
					desktop.browse(new URI("http://localhost:8080/tool/index.html"));
				} catch (Exception ee) {
					ee.printStackTrace();
				}
			}
		});
		booksPanel.add(launchBrowser);

		JButton validateButton = new JButton("Validate & book download");
		validateButton.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent arg0) {
				((CardLayout) mainPanel.getContentPane().getLayout()).show(mainPanel.getContentPane(), mainPanel.CARD_VALIDATION);
			}
		});

		add(booksPanel, BorderLayout.NORTH);
		add(validateButton, BorderLayout.SOUTH);
	}

	private static void startServer() {
		Server server = new Server();
		Connector connector = new SelectChannelConnector();
		connector.setHost("localhost");
		connector.setPort(8080);
		server.addConnector(connector);

		String webDir = ToolServer.class.getClassLoader().getResource("tool").toExternalForm();
		ResourceHandler resHandler = new ResourceHandler();
		resHandler.setResourceBase(webDir);

		ContextHandler staticHandler = new ContextHandler("/tool");
		staticHandler.setHandler(resHandler);

		ResourceHandler booksResHandler = new ResourceHandler();
		booksResHandler.setResourceBase(ToolServer.getBooksDir().getAbsolutePath());
		ContextHandler booksHandler = new ContextHandler("/getfiles");
		booksHandler.setHandler(booksResHandler);

		// ContextHandler apiHandler = new ContextHandler("/api");
		// apiHandler.setHandler(resHandler);

		ServletContextHandler servletContextHandler = new ServletContextHandler(server, "/savefile", true, false);
		servletContextHandler.addServlet(FileUploadServlet.class, "/*");

		ServletContextHandler formulaContextHandler = new ServletContextHandler(server, "/saveformula", true, false);
		formulaContextHandler.addServlet(FormulaServlet.class, "/*");

		// preview related
		ServletContextHandler previewContextHandler = new ServletContextHandler(server, "/preview", true, false);
		previewContextHandler.addServlet(PreviewServlet.class, "/*");

		String previewDir = ToolServer.class.getClassLoader().getResource("bookdesign").toExternalForm();
		System.out.println("preview:" + previewDir);
		ResourceHandler previewResHandler = new ResourceHandler();
		previewResHandler.setResourceBase(previewDir);
		ContextHandler previewStaticHandler = new ContextHandler("/preview_static");
		previewStaticHandler.setHandler(previewResHandler);

		ContextHandlerCollection contexts = new ContextHandlerCollection();
		contexts.addHandler(staticHandler);
		contexts.addHandler(booksHandler);
		contexts.addHandler(servletContextHandler);
		contexts.addHandler(formulaContextHandler);
		contexts.addHandler(previewContextHandler);
		contexts.addHandler(previewStaticHandler);
		contexts.addHandler(new DefaultHandler());
		server.setHandler(contexts);

		try {
			server.start();
			server.join();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void actionPerformed(ActionEvent arg0) {
		int result;

		chooser = new JFileChooser();
		chooser.setCurrentDirectory(new java.io.File("."));
		chooser.setDialogTitle(choosertitle);
		chooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
		//
		// disable the "All files" option.
		//
		chooser.setAcceptAllFileFilterUsed(false);
		//
		if (chooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
			System.out.println("getCurrentDirectory(): " + chooser.getCurrentDirectory());
			System.out.println("getSelectedFile() : " + chooser.getSelectedFile());
			ToolServer.setBooksDir(chooser.getSelectedFile());
			bookDir.setText(ToolServer.getBooksDir().toString());
		} else {
			System.out.println("No Selection ");
		}
	}

}
