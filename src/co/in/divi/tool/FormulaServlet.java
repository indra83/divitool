package co.in.divi.tool;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
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

public class FormulaServlet extends HttpServlet {

	private static String EQUATIONS = "equations";

	protected void processRequest(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		System.out.println(request.getPathInfo());
		response.setContentType("application/json;charset=UTF-8");
		File repository = ToolServer.getBooksDir();
		String data = request.getParameter("data");
		ArrayList<Map<String, String>> urlData;
		HashMap<String, Object> ouputData = new HashMap<String, Object>();
		try {
			if (!isEmpty(data)) {
				urlData = (ArrayList<Map<String, String>>) Json.deserialize(
						data, new TypeToken<List<Map<String, String>>>() {
						}.getType());
				response.setContentType("text/x-json");
				if (urlData != null && urlData.size() > 0) {
					for (Map<String, String> eachMap : urlData) {
						String name = eachMap.get("name");
						String url = eachMap.get("src");

						if (!isEmpty(name) && !isEmpty(url)) {
							File dirToUpload = new File(
									repository.getAbsolutePath(),
									request.getPathInfo() + "/" + EQUATIONS);
							if (!dirToUpload.exists())
								dirToUpload.mkdirs();
							File uploadedFile = new File(dirToUpload, name);
							System.out.println("uploading to "
									+ uploadedFile.toString());
							if (!uploadedFile.exists()) {
								uploadedFile.createNewFile();
							}
							// FileWriter fileOut = new
							// FileWriter(uploadedFile);
							FileOutputStream fileOut = new FileOutputStream(
									uploadedFile);

							URL obj = new URL(url);
							HttpURLConnection con = (HttpURLConnection) obj
									.openConnection();

							// optional default is GET
							con.setRequestMethod("GET");

							// add request header
							con.setRequestProperty("User-Agent", "Chrome");

							int responseCode = con.getResponseCode();
							System.out
									.println("\nSending 'GET' request to URL : "
											+ obj.toExternalForm());
							System.out.println("Response Code : "
									+ responseCode);

							InputStream is = con.getInputStream();

							byte buf[] = new byte[8192];
							int readCount;
							while ((readCount = is.read(buf)) >= 0) {
								fileOut.write(buf, 0, readCount);
							}
							is.close();
							fileOut.close();
						}
					}
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

	private boolean isEmpty(String str) {

		return (str == null || "".equals(str));
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
