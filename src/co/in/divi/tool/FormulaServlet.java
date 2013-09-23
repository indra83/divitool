package co.in.divi.tool;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class FormulaServlet extends HttpServlet {

	protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println(request.getPathInfo());
		response.setContentType("application/json;charset=UTF-8");
		PrintWriter out = response.getWriter();
		File repository = ToolServer.getBooksDir();
		try {
			String name = "blah.svg";
			File dirToUpload = new File(repository.getAbsolutePath(), request.getPathInfo());
			if (!dirToUpload.exists())
				dirToUpload.mkdirs();
			File uploadedFile = new File(dirToUpload, name);
			System.out.println("uploading to " + uploadedFile.toString());
			if (!uploadedFile.exists()) {
				uploadedFile.createNewFile();
			}
			FileWriter fileOut = new FileWriter(uploadedFile);
			fileOut.write("<?xml version=\"1.0\" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"> <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">  <circle cx=\"100\" cy=\"50\" r=\"40\" stroke=\"black\"  stroke-width=\"2\" fill=\"red\" /></svg>");
			fileOut.close();

			out.write("{\"name\":\"blah.svg\"}");
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
