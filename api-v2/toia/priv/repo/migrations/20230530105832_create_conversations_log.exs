defmodule Toia.Repo.Migrations.CreateConversationsLog do
  use Ecto.Migration

  def change do
    create table(:conversations_log, primary_key: false) do
      add :interactor_id, :integer
      add :timestamp, :integer, null: false
      add :filler, :boolean, default: true, null: false
      add :question_asked, :text
      add :video_played, :string, null: false
      add :ada_similarity_score, :float
      add :mode, :string
      add :toia_id, references(:toia_user, on_delete: :delete_all, type: :integer), null: false
    end

    create index(:conversations_log, [:toia_id])
    create index(:conversations_log, [:interactor_id])
  end
end
