# import necessary libraries
import os
from flask import Flask, render_template, url_for, json

# create instance of Flask app
app = Flask(__name__)


# create route that renders index.html template
@app.route("/")
def echo():

    return render_template("index.html")

@app.route("/samples.json")
def samples():
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    json_url = os.path.join(SITE_ROOT, "Test_Data", "full_table.json")
    data = json.load(open(json_url))
    return data

if __name__ == "__main__":
    app.run(debug=True)
