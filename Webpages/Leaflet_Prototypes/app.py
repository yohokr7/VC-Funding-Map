# import necessary libraries
from sqlalchemy import inspect
import os
from flask import Flask, render_template, url_for, json, jsonify
import pandas as pd
import config
from sqlalchemy import create_engine, func
from sqlalchemy.orm import Session
from sqlalchemy.ext.automap import automap_base

# create instance of Flask app
app = Flask(__name__)

# connect to the postgres database
connection_string = f'postgresql+psycopg2://{config.user}:{config.db_password}@localhost/vc_funding_db'

db = create_engine(connection_string)

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(db, reflect=True)

print([a for a in Base.classes])

VC_Funding = Base.classes.vc_funding

mapper = inspect(VC_Funding)


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

@app.route("/api/city/<city>")
def city_data(city):
    session = Session(db)

    results = session.query(VC_Funding).filter(VC_Funding.city == city).first()
    #code from Stack Overflow - needed to know to use getattr instead of 
    #bracket notation for sqlalchemy objects!
    def get_model_dict(model):
        return dict((column.name, getattr(model, column.name))
                for column in model.__table__.columns)

    return get_model_dict(results)

if __name__ == "__main__":
    app.run(debug=True)
