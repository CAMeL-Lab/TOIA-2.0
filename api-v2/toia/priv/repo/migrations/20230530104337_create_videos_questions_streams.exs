defmodule Toia.Repo.Migrations.CreateVideosQuestionsStreams do
  use Ecto.Migration

  def change do
    create table(:videos_questions_streams, primary_key: false) do
      add :id_video, references(:video, on_delete: :delete_all, type: :string, column: :id_video), null: false, primary_key: true
      add :id_question, references(:questions, on_delete: :delete_all, type: :integer), null: false, primary_key: true
      add :id_stream, references(:stream, on_delete: :delete_all, type: :integer, column: :id_stream), null: false, primary_key: true
      add :type, :"ENUM('filler', 'greeting', 'answer', 'exit', 'no-answer', 'y/n-answer')", null: false
      add :ada_search, :text
    end

    create index(:videos_questions_streams, [:id_question])
    create index(:videos_questions_streams, [:id_stream])
  end
end
