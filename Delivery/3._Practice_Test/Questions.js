// Questions data — content applied from tests.docx storyboard.
// Edited directly per deliverable (the Excel build pipeline was removed).

export const QUESTIONS_DATA = [
  {
    "id": "Q1",
    "sheet": "1a: Level of Consciousness",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 9,
    "options": [
      { "text": "0", "description": "Alert; keenly responsive", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Not alert; but arousable by minor stimulation to obey, answer, or respond", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Not alert; requires repeated stimulation or strong or painful stimulation", "feedback": "", "rationale": "", "correct": false },
      { "text": "3", "description": "Responds only with reflex motor or autonomic effects, or totally unresponsive", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q2",
    "sheet": "1b: Level of Consciousness Questions",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 20,
    "options": [
      { "text": "0", "description": "Answers both questions correctly", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Answers one question correctly", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Answers neither question correctly", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q3",
    "sheet": "1c: Level of Consciousness Commands",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 48,
    "options": [
      { "text": "0", "description": "Performs both tasks correctly", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Performs one task correctly", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Performs neither task correctly", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q4",
    "sheet": "2: Best Gaze",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 75,
    "options": [
      { "text": "0", "description": "Normal", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Partial gaze palsy; abnormal gaze in one or both eyes, but forced deviation or total gaze paresis is not present", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Forced deviation, or total gaze paresis is not overcome by the oculocephalic maneuver", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q5",
    "sheet": "3: Visual",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 189,
    "options": [
      { "text": "0", "description": "No visual loss", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Partial hemianopia", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Complete hemianopia", "feedback": "", "rationale": "", "correct": false },
      { "text": "3", "description": "Bilateral hemianopia (blind, including cortical blindness)", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q6",
    "sheet": "4: Facial Palsy",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 208,
    "options": [
      { "text": "0", "description": "Normal, symmetrical movements", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Minor paralysis (flattened nasolabial fold, asymmetry on smiling)", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Partial paralysis (total or near-total paralysis of lower face)", "feedback": "", "rationale": "", "correct": false },
      { "text": "3", "description": "Complete paralysis of one or both sides (absence of facial movement in the upper and lower face)", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q7",
    "sheet": "5: Motor Arm (Left)",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 269,
    "chainTo": "Q8",
    "options": [
      { "text": "0", "description": "No drift; limb holds 90° (or 45°) for full 10 seconds", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Drift; limb holds 90° (or 45°) but drifts down before full 10 seconds; does not hit bed or other support", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Some effort against gravity; limb cannot get to or maintain (if cued) 90° (or 45°), drifts down to bed but has some effort against gravity", "feedback": "", "rationale": "", "correct": false },
      { "text": "3", "description": "No effort against gravity; limb falls", "feedback": "", "rationale": "", "correct": false },
      { "text": "4", "description": "No movement", "feedback": "", "rationale": "", "correct": false },
      { "text": "UN", "description": "Amputation or joint fusion", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q8",
    "sheet": "5: Motor Arm (Right)",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 269,
    "chained": true,
    "options": [
      { "text": "0", "description": "No drift; limb holds 90° (or 45°) for full 10 seconds", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Drift; limb holds 90° (or 45°) but drifts down before full 10 seconds; does not hit bed or other support", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Some effort against gravity; limb cannot get to or maintain (if cued) 90° (or 45°), drifts down to bed but has some effort against gravity", "feedback": "", "rationale": "", "correct": false },
      { "text": "3", "description": "No effort against gravity; limb falls", "feedback": "", "rationale": "", "correct": false },
      { "text": "4", "description": "No movement", "feedback": "", "rationale": "", "correct": false },
      { "text": "UN", "description": "Amputation or joint fusion", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q9",
    "sheet": "6: Motor Leg (Left)",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 301,
    "chainTo": "Q10",
    "options": [
      { "text": "0", "description": "No drift; leg holds 30° position for full 5 seconds", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Drift; leg falls by the end of the 5-second period but does not hit bed", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Some effort against gravity; leg falls to bed by 5 seconds but has some effort against gravity", "feedback": "", "rationale": "", "correct": false },
      { "text": "3", "description": "No effort against gravity; leg falls to bed immediately", "feedback": "", "rationale": "", "correct": false },
      { "text": "4", "description": "No movement", "feedback": "", "rationale": "", "correct": false },
      { "text": "UN", "description": "Amputation or joint fusion", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q10",
    "sheet": "6: Motor Leg (Right)",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 301,
    "chained": true,
    "options": [
      { "text": "0", "description": "No drift; leg holds 30° position for full 5 seconds", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Drift; leg falls by the end of the 5-second period but does not hit bed", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Some effort against gravity; leg falls to bed by 5 seconds but has some effort against gravity", "feedback": "", "rationale": "", "correct": false },
      { "text": "3", "description": "No effort against gravity; leg falls to bed immediately", "feedback": "", "rationale": "", "correct": false },
      { "text": "4", "description": "No movement", "feedback": "", "rationale": "", "correct": false },
      { "text": "UN", "description": "Amputation or joint fusion", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q11",
    "sheet": "7: Limb Ataxia",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 416,
    "options": [
      { "text": "0", "description": "Absent", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Present in 1 limb", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Present in 2 limbs", "feedback": "", "rationale": "", "correct": false },
      { "text": "UN", "description": "Amputation or joint fusion", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q12",
    "sheet": "8: Sensory",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 462,
    "options": [
      { "text": "0", "description": "Normal; no sensory loss", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Mild to moderate sensory loss; patient feels noxious stimuli is dull on the affected side; or there is a loss of superficial pain, but patient is aware of being touched", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Severe or total sensory loss; patient is not aware of being touched in the face, arm, and leg", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q13",
    "sheet": "9: Best Language",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 611,
    "options": [
      { "text": "0", "description": "No aphasia; normal", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Mild to moderate aphasia; some obvious loss of fluency or facility of comprehension, without significant limitation on ideas expressed or form of expression", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Severe aphasia; all communication is through fragmentary expression; great need for inference, questioning, and guessing by the listener", "feedback": "", "rationale": "", "correct": false },
      { "text": "3", "description": "Mute, global aphasia; no usable speech or auditory comprehension", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q14",
    "sheet": "10: Dysarthria",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 624,
    "options": [
      { "text": "0", "description": "Normal", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Mild to moderate dysarthria; patient slurs at least some words and, at worst, can be understood with some difficulty", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Severe dysarthria; patient's speech is so slurred as to be unintelligible in the absence of or out of proportion to any dysphasia, or is mute or anarthric", "feedback": "", "rationale": "", "correct": false },
      { "text": "UN", "description": "Intubated or other physical barrier", "feedback": "", "rationale": "", "correct": false }
    ]
  },
  {
    "id": "Q15",
    "sheet": "11: Extinction and Inattention",
    "question": "On the basis of what you saw in the video, how would you score this patient?\nChoose the correct answer, and select Submit.",
    "time": 774,
    "options": [
      { "text": "0", "description": "No abnormality", "feedback": "", "rationale": "<PASTE RATIONALE HERE>", "correct": true },
      { "text": "1", "description": "Visual, tactile, auditory, spatial, or personal inattention, or extinction to bilateral simultaneous stimulation in one of the sensory modalities", "feedback": "", "rationale": "", "correct": false },
      { "text": "2", "description": "Profound hemi-inattention or extinction to more than one modality; does not recognize own hand or orients to only one side of space", "feedback": "", "rationale": "", "correct": false }
    ]
  }
];
