package co.in.divi.tool;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.reflect.TypeToken;

public class FetchQuestions extends HttpServlet {

	private static String Questions = "question.xml";

	protected void processRequest(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		System.out.println(request.getPathInfo());
		response.setContentType("application/json;charset=UTF-8");
		File repository = ToolServer.getBooksDir();
		File filePath;
		String[] idsStr = null;
		String responseText;
		FileHandler fileHandler = new FileHandler();
		HashMap<String, Object> ouputData = new HashMap<String, Object>();
		try {
				response.setContentType("text/x-json");
				String assessmentLoc = request.getParameter("url");
				String idString = request.getParameter("ids");
				if(idString != null){
					idsStr = idString.split(",");
				}
				if(idsStr != null && idsStr.length > 0 && assessmentLoc != null){
					for (String eachStr : idsStr) {
						responseText = fileHandler.readXML(repository.getAbsolutePath()+"/" +assessmentLoc+"/"+eachStr+"/"+ Questions);
						ouputData.put(eachStr, responseText);
					}
				}
			ouputData.put("Success", true);
			String returnValue = Json.serialize(ouputData);
			response.getOutputStream().write(returnValue.getBytes());
		} catch (Exception ex) {
			ex.printStackTrace();
			System.out.println(ex.getMessage());
		} finally {
		}
	}

	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		processRequest(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		processRequest(request, response);
	}
}