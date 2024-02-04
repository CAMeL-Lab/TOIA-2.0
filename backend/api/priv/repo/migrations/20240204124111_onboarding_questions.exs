defmodule Toia.Repo.Migrations.OnboardingQuestions do
  use Ecto.Migration

  def up do
    execute """
      INSERT INTO questions (question, suggested_type, priority, trigger_suggester)
      VALUES ('Attentive filler video: Record yourself touching your hair/head/face staring at the camera (think making eye contact with a user interacting with your avatar)', 'filler', 0, false),
             ('Attentive filler: Nod/shake head to show you are listening, and keep staring at the camere (make eye contact)', 'filler', 1, false),
              ('Attentive filler: Smile and blink eyes while looking towards the camera (make eye contact) for about 10 seconds', 'filler', 2, false),
              ('Attentive filler: Lean slightly forward with your elbows on the table and your hands together on your chin as if you were attentive to the camera', 'filler', 3, false),
              ('Attentive filler: Cross hands while looking forward into the camera', 'filler', 4, false),
              ('Inattentive filler video: Now record again yourself touching your hair/head/face, but don''t look at the camera. Look elsewhere (don''t make eye contact)', 'filler', 5, false),
              ('Inattentive filler: Do not nod/shake head and look elsewhere from the camera. Show you are engageing with somebody else in the room, do not stare at the camera (avoid eye contact)', 'filler', 6, false),
              ('Inattentive filler: Look downward, do not stare at the camera (avoid eye contact) for about 10 seconds', 'filler', 7, false),
              ('Inattentive filler: Lean slightly backwards, like trying to relax, gaze around and never look at the camera (avoid eye contact)', 'filler', 8, false),
              ('Inattentive filler: Cross hands while looking upward or elsewere, looking bored, avoiding eye contact with the camera', 'filler', 9, false),
              ('Say: I don''t have an answer to that right now.', 'no-answer', 10, false),
              ('Say: Sorry, I didn''t record answers to that question.', 'no-answer', 11, false),
              ('Say: Can you try rephrasing the question?', 'no-answer', 12, false),
              ('Record a greeting (e.g., hello, hi)', 'greeting', 13, false),
              ('Record a goodbye (or end of conversation sentence)', 'exit', 14, false),
              ('What is your name?', 'answer', 15, true),
              ('Where and when were you born?', 'answer', 16, true),
              ('What do you do for a living?', 'answer', 17, true),
              ('Record yourself saying Yes. You cann add questions for this answer later.', 'y/n-answer', 18, false),
              ('Record yourself saying No. You can add questions for this answer later.', 'y/n-answer', 19, false)
    """
  end

  def down do
    execute """
      DELETE FROM questions
      WHERE question IN ('Attentive filler video: Record yourself touching your hair/head/face staring at the camera (think making eye contact with a user interacting with your avatar)',
                         'Attentive filler: Nod/shake head to show you are listening, and keep staring at the camere (make eye contact)',
                         'Attentive filler: Smile and blink eyes while looking towards the camera (make eye contact) for about 10 seconds',
                         'Attentive filler: Lean slightly forward with your elbows on the table and your hands together on your chin as if you were attentive to the camera',
                         'Attentive filler: Cross hands while looking forward into the camera',
                         'Inattentive filler video: Now record again yourself touching your hair/head/face, but don''t look at the camera. Look elsewhere (don''t make eye contact)',
                         'Inattentive filler: Do not nod/shake head and look elsewhere from the camera. Show you are engageing with somebody else in the room, do not stare at the camera (avoid eye contact)',
                         'Inattentive filler: Look downward, do not stare at the camera (avoid eye contact) for about 10 seconds',
                         'Inattentive filler: Lean slightly backwards, like trying to relax, gaze around and never look at the camera (avoid eye contact)',
                         'Inattentive filler: Cross hands while looking upward or elsewere, looking bored, avoiding eye contact with the camera',
                         'Say: I don''t have an answer to that right now.',
                         'Say: Sorry, I didn''t record answers to that question.',
                         'Say: Can you try rephrasing the question?',
                         'Record a greeting (e.g., hello, hi)',
                         'Record a goodbye (or end of conversation sentence)',
                         'What is your name?',
                         'Where and when were you born?',
                         'What do you do for a living?',
                         'Record yourself saying Yes. You cann add questions for this answer later.',
                         'Record yourself saying No. You can add questions for this answer later.')
    """
  end
end
