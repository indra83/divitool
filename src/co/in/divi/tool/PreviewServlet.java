package co.in.divi.tool;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class PreviewServlet extends HttpServlet {

	protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println(request.getPathInfo());
		response.setContentType("text/html;charset=UTF-8");
		PrintWriter out = response.getWriter();
		File repository = ToolServer.getBooksDir();

		try {
			String topicXmlPath = request.getQueryString();

			File topicXmlFile = new File(repository, topicXmlPath);
			System.out.println("topic file is " + topicXmlFile.toString());
			TopicHTMLGenerator htmlGenerator = new TopicHTMLGenerator("/getfiles/"+repository.toURI().relativize(topicXmlFile.getParentFile().toURI())
					.getPath());

			String toReturn = htmlGenerator.getTopicHTML(topicXmlFile, null, null, "blah");
			System.out.print("out:" + toReturn);

			out.write(toReturn);
		} catch (Exception ex) {
			ex.printStackTrace();
			System.out.println(ex.getMessage());
		} finally {
			out.close();
		}
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		processRequest(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		processRequest(request, response);
	}
}
