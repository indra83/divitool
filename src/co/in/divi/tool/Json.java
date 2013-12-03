package co.in.divi.tool;

import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

public class Json {

	private static Gson gson = new GsonBuilder().serializeNulls().create();

	// private Map <String, Field[]> currentObjectFields;

	private static GsonBuilder gsonMapBuilder;

	private GsonBuilder getGsonBuilder() {

		if (gsonMapBuilder == null) {
			gsonMapBuilder = new GsonBuilder();
			gsonMapBuilder.registerTypeAdapter(Object.class,
					new NaturalDeserializer());
		}
		return gsonMapBuilder;
	}

	private static Gson gsonMapDeserializer;

	private Gson getMapDeserializer() {

		if (gsonMapDeserializer == null) {
			gsonMapDeserializer = getGsonBuilder().create();
		}
		return gsonMapDeserializer;
	}

	public HashMap<String, Object> deserializeMap(String jsonString) {

		Gson gsonMapBuilder = getMapDeserializer();
		return gsonMapBuilder.fromJson(jsonString,
				new HashMap<String, Object>().getClass());
	}

	public static String serialize(Object data) {

		String returnString = "";
		if (null != data) {
			if (!(data instanceof JsonObject)) {
				returnString = jsontoString(data);
			} else if (data instanceof JsonObject) {
				returnString = data.toString();
			}
		}

		return returnString;
	}
	
	 public static <T> String jsontoString( T element ) {

	      String returnString = "";
	      if( null != element ) {
	         returnString = gson.toJson( element );
	      }
	      return returnString;
	   }

	public <T> T deserialize(String jsonString, Class<T> obj) {

		return gson.fromJson(jsonString, obj);
	}

	public <T> T deserialize(Object jsonString, Class<T> obj) {

		return gson.fromJson((String) jsonString, obj);
	}

	public static Object deserialize(String jsonString, Type typeofT) {

		return gson.fromJson(jsonString, typeofT);
	}

	private static class NaturalDeserializer implements
			JsonDeserializer<Object> {

		public Object deserialize(JsonElement json, Type typeOfT,
				JsonDeserializationContext context) {

			if (json.isJsonNull())
				return null;
			else if (json.isJsonPrimitive())
				return handlePrimitive(json.getAsJsonPrimitive());
			else if (json.isJsonArray())
				return handleArray(json.getAsJsonArray(), context);
			else
				return handleObject(json.getAsJsonObject(), context);
		}

		private Object handlePrimitive(JsonPrimitive json) {

			if (json.isBoolean())
				return json.getAsBoolean();
			else if (json.isString())
				return json.getAsString();
			else {
				BigDecimal bigDec = json.getAsBigDecimal();
				// Find out if it is an int type
				try {
					bigDec.toBigIntegerExact();
					try {
						return bigDec.intValueExact();
					} catch (ArithmeticException e) {
					}
					return bigDec.longValue();
				} catch (ArithmeticException e) {
				}
				// Just return it as a double
				return bigDec.doubleValue();
			}
		}

		private Object handleArray(JsonArray json,
				JsonDeserializationContext context) {

			Object[] array = new Object[json.size()];
			for (int i = 0; i < array.length; i++)
				array[i] = context.deserialize(json.get(i), Object.class);
			return array;
		}

		private Object handleObject(JsonObject json,
				JsonDeserializationContext context) {

			Map<String, Object> map = new HashMap<String, Object>();
			for (Map.Entry<String, JsonElement> entry : json.entrySet())
				map.put(entry.getKey(),
						context.deserialize(entry.getValue(), Object.class));
			return map;
		}
	}

}
