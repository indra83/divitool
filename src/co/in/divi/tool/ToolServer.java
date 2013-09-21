package co.in.divi.tool;

import java.awt.BorderLayout;
import java.awt.Desktop;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.net.URI;
import java.util.prefs.Preferences;

import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.server.nio.SelectChannelConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;

public class ToolServer extends JFrame implements ActionListener {

	private static final String	PREF_BOOKS_DIR	= "PREF_BOOKS_DIR";

	JButton						selectBooksDir;
	JLabel						bookDir;
	JFileChooser				chooser;
	String						choosertitle;

	public static void main(String[] args) {

		SwingUtilities.invokeLater(new Runnable() {
			@Override
			public void run() {
				ToolServer ex = new ToolServer();
				ex.setVisible(true);
			}
		});
		System.out.println("started UI...");

		startServer();
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
		booksResHandler.setResourceBase(getBooksDir().getAbsolutePath());
		ContextHandler booksHandler = new ContextHandler("/getfiles");
		booksHandler.setHandler(booksResHandler);

		// ContextHandler apiHandler = new ContextHandler("/api");
		// apiHandler.setHandler(resHandler);

		ServletContextHandler servletContextHandler = new ServletContextHandler(server, "/savefile", true, false);
		servletContextHandler.addServlet(FileUploadServlet.class, "/*");

		ContextHandlerCollection contexts = new ContextHandlerCollection();
		contexts.addHandler(staticHandler);
		contexts.addHandler(booksHandler);
		contexts.addHandler(servletContextHandler);
		contexts.addHandler(new DefaultHandler());
		server.setHandler(contexts);

		try {
			server.start();
			server.join();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static void setBooksDir(File booksDir) {
		Preferences prefs = Preferences.userNodeForPackage(ToolServer.class);
		prefs.put(PREF_BOOKS_DIR, booksDir.getPath());
	}

	public static File getBooksDir() {
		Preferences prefs = Preferences.userNodeForPackage(ToolServer.class);
		String booksDir = prefs.get(PREF_BOOKS_DIR, null);
		if (booksDir != null) {
			return new File(booksDir);
		}
		return null;
	}

	public ToolServer() {
		// books directory
		JPanel booksPanel = new JPanel(new GridLayout(1, 2));
		bookDir = new JLabel();
		if (getBooksDir() != null)
			bookDir.setText(getBooksDir().toString());
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
				Desktop desktop = Desktop.isDesktopSupported() ? Desktop.getDesktop() : null;
				if (desktop != null && desktop.isSupported(Desktop.Action.BROWSE)) {
					try {
						desktop.browse(new URI("http://localhost:8080/tool/index.html"));
					} catch (Exception ee) {
						ee.printStackTrace();
					}
				}
			}
		});

		add(booksPanel, BorderLayout.NORTH);
		add(launchBrowser, BorderLayout.SOUTH);

		setTitle("Simple example");
		setSize(600, 300);
		setLocationRelativeTo(null);
		setDefaultCloseOperation(EXIT_ON_CLOSE);
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
			setBooksDir(chooser.getSelectedFile());
			bookDir.setText(getBooksDir().toString());
		} else {
			System.out.println("No Selection ");
		}
	}
}