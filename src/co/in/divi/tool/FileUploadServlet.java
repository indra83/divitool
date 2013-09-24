package co.in.divi.tool;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

public class FileUploadServlet extends HttpServlet {

	protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println(request.getPathInfo());
		response.setContentType("text/html;charset=UTF-8");
		PrintWriter out = response.getWriter();
		File repository = ToolServer.getBooksDir();
		try {
			DiskFileItemFactory diskFileItemFactory = new DiskFileItemFactory();
			// set temporary dir where uploaded files will be stored
			diskFileItemFactory.setRepository(repository);
			// set the file size threshold beyond from which file will be stored in the disk
			diskFileItemFactory.setSizeThreshold(5 * 1024 * 1024);
			// initialize form handler
			ServletFileUpload servletFileUpload = new ServletFileUpload(diskFileItemFactory);
			// get form fields
			List<FileItem> uploadedItems = servletFileUpload.parseRequest(request);
			for (FileItem fileItem : uploadedItems) {
				// if file item is a normal form filed take some action
				if (fileItem.isFormField()) {
					String fieldName = fileItem.getFieldName();
					System.out.println("FIELDNAME:" + fieldName);
				} else {
					String name = fileItem.getName();
					System.out.println("NAME:" + name);
					File dirToUpload;
					if (request.getPathInfo() != null && request.getPathInfo().length() > 0)
						dirToUpload = new File(repository.getAbsolutePath(), request.getPathInfo());
					else
						dirToUpload = repository;
					if (!dirToUpload.exists())
						dirToUpload.mkdirs();
					File uploadedFile = new File(dirToUpload, name);
					System.out.println("uploading to " + uploadedFile.toString());
					if (!uploadedFile.exists()) {
						uploadedFile.createNewFile();
					}
					fileItem.write(uploadedFile);
				}
			}

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