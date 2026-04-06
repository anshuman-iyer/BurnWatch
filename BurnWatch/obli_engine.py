# olbi_engine.py

# 1 = Strongly Agree, 2 = Agree, 3 = Disagree, 4 = Strongly Disagree
# 'R' indicates Reverse Scored questions (Positively worded)
OLBI_QUESTIONS = [
    {"id": 1, "text": "I always find new and interesting aspects in my work.", "type": "Disengagement", "reverse": True},
    {"id": 2, "text": "There are days when I feel tired before I arrive at work.", "type": "Exhaustion", "reverse": False},
    {"id": 3, "text": "It happens more and more often that I talk about my work in a negative way.", "type": "Disengagement", "reverse": False},
    {"id": 4, "text": "After work, I usually feel worn out and weary.", "type": "Exhaustion", "reverse": False},
    {"id": 5, "text": "I can tolerate the pressure of my work very well. ", "type": "Exhaustion", "reverse": True},
    {"id": 6, "text": "Lately, I tend to think less at work and do my job almost mechanically.", "type": "Disengagement", "reverse": False},
    {"id": 7, "text": "I find my work to be a positive challenge.", "type": "Disengagement", "reverse": True},
    {"id": 8, "text": "During my work, I often feel emotionally drained.", "type": "Exhaustion", "reverse": False},
    {"id": 9, "text": "", "type": "Disengagement", "reverse": False},
    {"id": 10, "text": "After working, I have enough energy for my leisure activities.", "type": "Exhaustion", "reverse": True},
    {"id": 11, "text": "Sometimes I feel sickened by my work tasks.", "type": "Disengagement", "reverse": False},
    {"id": 12, "text": "After my work, I usually feel worn out and weary.", "type": "Exhaustion", "reverse": False},
    {"id": 13, "text": "This is the only type of work that I can imagine myself doing.", "type": "Disengagement", "reverse": True},
    {"id": 14, "text": "Usually, I can manage the amount of my work well.", "type": "Exhaustion", "reverse": True},
    {"id": 15, "text": "I feel more and more engaged in my work.", "type": "Disengagement", "reverse": True},
    {"id": 16, "text": "When I work, I usually feel energized.", "type": "Exhaustion", "reverse": True},

]

def calculate_olbi(user_responses):
    """
    user_responses: List of dicts e.g. [{"id": 1, "score": 2}, ...]
    """
    exhaustion_scores = []
    disengagement_scores = []

    for resp in user_responses:
        q_meta = next(q for q in OLBI_QUESTIONS if q["id"] == resp["id"])
        
        # Logic: If Reverse Scored (Positive), 1 becomes 4, 2 becomes 3, etc.
        final_score = (5 - resp["score"]) if q_meta["reverse"] else resp["score"]
        
        if q_meta["type"] == "Exhaustion":
            exhaustion_scores.append(final_score)
        else:
            disengagement_scores.append(final_score)

    results = {
        "exhaustion_avg": sum(exhaustion_scores) / len(exhaustion_scores),
        "disengagement_avg": sum(disengagement_scores) / len(disengagement_scores)
    }
    
    # Calculate overall Burnout Probability
    results["total_index"] = (results["exhaustion_avg"] + results["disengagement_avg"]) / 2
    return results