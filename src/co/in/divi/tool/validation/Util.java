package co.in.divi.tool.validation;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.AlgorithmParameters;

import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;

public class Util {
	public static final String	BOOK_DEFINITION_FILE_NAME	= "master.json";
	
	public static String openJSONFile(File jsonFile) {
		String ret = null;
		BufferedReader rd = null;
		try {
			InputStream is = new FileInputStream(jsonFile);
			String line = "";
			StringBuilder total = new StringBuilder();

			// Wrap a BufferedReader around the InputStream
			rd = new BufferedReader(new InputStreamReader(is));

			// Read response until the end
			while ((line = rd.readLine()) != null) {
				total.append(line);
			}
			ret = total.toString();
			rd.close();
		} catch (IOException ioe) {
			return null;
		}
		return ret;
	}

	public static void encryptFile(File fileToEncrypt, SecretKey secret) {
		try {
			Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
			cipher.init(Cipher.ENCRYPT_MODE, secret);

			AlgorithmParameters params = cipher.getParameters();
			byte[] iv = params.getParameterSpec(IvParameterSpec.class).getIV();

			File encFile = new File(fileToEncrypt.getParentFile(), "enc-"
					+ fileToEncrypt.getName());
			encFile.delete();
			encFile.createNewFile();
			FileOutputStream fos = new FileOutputStream(encFile, false);
			fos.write(iv);
			CipherOutputStream cos = new CipherOutputStream(fos, cipher);

			FileInputStream fis = new FileInputStream(fileToEncrypt);
			int b;
			byte[] d = new byte[8];
			while ((b = fis.read(d)) != -1) {
				cos.write(d, 0, b);
			}
			cos.flush();
			cos.close();
			fis.close();

			// delete original file and rename encrypted file
			fileToEncrypt.delete();
			boolean success = encFile.renameTo(fileToEncrypt);
			if (!success)
				throw new Exception("Error encrypting file - " + fileToEncrypt);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public static void decryptFile(File fileToDecrypt, SecretKey secret) {
		try {
			byte[] iv = new byte[16];
			FileInputStream fis = new FileInputStream(fileToDecrypt);
			fis.read(iv);
			
			Cipher cipher2 = Cipher.getInstance("AES/CBC/PKCS5Padding");
	        cipher2.init(Cipher.DECRYPT_MODE, secret, new IvParameterSpec(iv));
	        CipherInputStream cis = new CipherInputStream(fis, cipher2);
	        
	        File decFile = new File(fileToDecrypt.getParentFile(),"dec-"+fileToDecrypt.getName());
	        decFile.delete();
	        decFile.createNewFile();
	        
	        FileOutputStream fos = new FileOutputStream(decFile);
	        int b;
			byte[] d = new byte[8];
	        while((b=cis.read(d))!=-1) {
	        	fos.write(d,0,b);
	        }
	        fos.flush();
	        fos.close();
	        cis.close();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}
