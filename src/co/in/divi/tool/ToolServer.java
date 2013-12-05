package co.in.divi.tool;

import java.awt.CardLayout;
import java.awt.Dimension;
import java.io.File;
import java.util.prefs.Preferences;

import javax.swing.BorderFactory;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

import co.in.divi.tool.ui.HomePanel;
import co.in.divi.tool.ui.ValidationPanel;

public class ToolServer extends JFrame {

	private static final String	PREF_BOOKS_DIR	= "PREF_BOOKS_DIR";
	public static final String	CARD_HOME		= "HOME";
	public static final String	CARD_VALIDATION	= "VALIDATION";

	public static void main(String[] args) {

		SwingUtilities.invokeLater(new Runnable() {
			@Override
			public void run() {
				ToolServer ex = new ToolServer();
				ex.setVisible(true);
			}
		});
		System.out.println("started UI...");
	}

	public static void setBooksDir(File booksDir) {
		Preferences prefs = Preferences.userNodeForPackage(ToolServer.class);
		prefs.put(PREF_BOOKS_DIR, booksDir.getPath());
	}

	public static File getBooksDir() {
		Preferences prefs = Preferences.userNodeForPackage(ToolServer.class);
		// DEBUG
		// prefs.remove(PREF_BOOKS_DIR);
		// END DEBUG
		String booksDir = prefs.get(PREF_BOOKS_DIR, null);
		if (booksDir != null) {
			return new File(booksDir);
		}
		return null;
	}

	private HomePanel		homePanel;
	private ValidationPanel	validationPanel;

	public ToolServer() {
		super();
		// books directory
		setDefaultCloseOperation(EXIT_ON_CLOSE);
		setTitle("Divi Content Creator");
		setLocationRelativeTo(null);

		JPanel contentPane = new JPanel();
		contentPane.setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));
		contentPane.setLayout(new CardLayout());
		homePanel = new HomePanel(this);
		validationPanel = new ValidationPanel(this);
		contentPane.add(homePanel, CARD_HOME);
		contentPane.add(validationPanel, CARD_VALIDATION);
		// contentPane.setSize(650, 650);
		setPreferredSize(new Dimension(650, 650));
		setContentPane(contentPane);
		pack();
		setLocationByPlatform(true);
		setVisible(true);
	}
}