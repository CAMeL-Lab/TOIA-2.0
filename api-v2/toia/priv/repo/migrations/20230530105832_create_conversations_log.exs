defmodule Toia.Repo.Migrations.CreateConversationsLog do
  use Ecto.Migration

  def change do
    create table(:conversations_log, primary_key: false) do
      add :interactor_id, references(:toia_user, on_delete: :delete_all, type: :serial), default: nil
      add :toia_id, references(:toia_user, on_delete: :delete_all, type: :serial), null: false
      add :timestamp, :bigint, null: false
      add :filler, :boolean, default: true, null: false
      add :question_asked, :text
      add :video_played, references(:video, on_delete: :delete_all, type: :string, column: :id_video), null: false
      add :ada_similarity_score, :float, default: nil
      add :mode, :string, default: nil
    end

    create index(:conversations_log, [:toia_id])
    create index(:conversations_log, [:interactor_id])
    create index(:conversations_log, [:video_played])
  end
end
