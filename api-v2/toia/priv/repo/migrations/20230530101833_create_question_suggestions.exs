defmodule Toia.Repo.Migrations.CreateQuestionSuggestions do
  use Ecto.Migration

  def change do
    create table(:question_suggestions, primary_key: false) do
      add :id_question, references(:questions, on_delete: :delete_all, type: :integer), primary_key: true, null: false
      add :isPending, :boolean, default: true, null: false
      add :toia_id, references(:toia_user, on_delete: :delete_all, type: :integer), null: false, primary_key: true
    end

    create index(:question_suggestions, [:toia_id])
  end
end
