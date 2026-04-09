import google.generativeai as genai
import traceback

genai.configure(api_key='AIzaSyCJkohXJKGI-JkcituLlpLJ_1eXc1n4iFw')

try:
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("Trying 1.5-flash-latest:")
    print(model.generate_content('hi'))
except Exception as e:
    print("Error with 1.5-flash-latest:")
    traceback.print_exc()

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("Trying 1.5-flash:")
    print(model.generate_content('hi'))
except Exception as e:
    print("Error with 1.5-flash:")
    traceback.print_exc()
