import google.generativeai as genai
import constant
from flask import Flask, request, jsonify
app = Flask(__name__)

# Or use `os.getenv('GOOGLE_API_KEY')` to fetch an environment variable.
GOOGLE_API_KEY = constant.Api_key

genai.configure(api_key=GOOGLE_API_KEY)

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
model = genai.GenerativeModel('gemini-pro-vision')


@app.route('/create_recipe', methods=['POST'])
def create_recipe():
    # Check if the 'image' key is in the files of the request
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'})

    image_file = request.files['image']

    # Validate that an image is present
    if not image_file or not allowed_file(image_file.filename):
        return jsonify({'error': 'Invalid or no image provided'})

    image_parts = {
        "mime_type": image_file.mimetype,
        "data": image_file.read(),
    }

    prompt_parts = [
        image_parts,
        "List the vegetables in the image and use them to list out all the recipes keep it Indian. Use one recipe and give instructions to create it.\n",
    ]

    response = model.generate_content(prompt_parts)

    return jsonify({'text': response.text})

# Define a function to check if the file extension is allowed


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


if __name__ == '__main__':
    app.run(debug=True)
