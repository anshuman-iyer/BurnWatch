from flask import Flask, request, jsonify
from olbi_engine import calculate_olbi

app = Flask(__name__)

@app.route("/api/olbi", methods=["POST"])
def compute_olbi():
    data = request.json
    results = calculate_olbi(data["responses"])
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)