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

VC_Funding = Base.classes.vc_funding

mapper = inspect(VC_Funding)


# create route that renders index.html template
@app.route("/")
def echo():
    return render_template("index.html")

@app.route("/samples.json")
def samples():
    # SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    # json_url = os.path.join(SITE_ROOT, "Test_Data", "full_table.json")
    # data = json.load(open(json_url))
    session = Session(db)
    results = session.query(VC_Funding).all()
    data = {}
    for i in range(len(results)):
        data[i] = get_model_dict(results[i])

    session.close()

    return data

# gives a dynamic api that serves the data
# from the database for each city requested
@app.route("/api/city/<country_code>/<city>")
def city_data(country_code, city):
    session = Session(db)
    # only need one result for each city query
    results = session.query(VC_Funding).filter(
        VC_Funding.city == city).filter((VC_Funding.country_code == country_code)).first()
    session.close()
    return get_model_dict(results)

# code from Stack Overflow - needed to know to use getattr instead of
# bracket notation for sqlalchemy objects! Access only probably through a getter function
def get_model_dict(model):
    return dict((column.name, getattr(model, column.name))
                for column in model.__table__.columns)

if __name__ == "__main__":
    app.run(debug=True)
