defmodule Toia.Repo.Migrations.CreateQuestions do
  use Ecto.Migration

  def change do
    create table(:questions, primary_key: false) do
      add :id, :integer, primary_key: true, null: false, auto_increment: true
      add :question, :string, null: false
      add :suggested_type, :"ENUM('filler', 'greeting', 'answer', 'exit', 'no-answer', 'y/n-answer')", null: false
      add :onboarding, :boolean, default: false, null: false
      add :priority, :integer, null: false
      add :trigger_suggester, :boolean, default: true, null: false
    end
  end
end
