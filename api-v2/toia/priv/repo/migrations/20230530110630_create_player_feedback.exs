defmodule Toia.Repo.Migrations.CreatePlayerFeedback do
  use Ecto.Migration

  def change do
    create table(:player_feedback) do
      add :video_id, references(:video, on_delete: :delete_all, type: :string, column: :id_video), null: false
      add :user_id, references(:toia_user, on_delete: :delete_all, type: :integer), default: nil
      add :question, :text, null: false
      add :rating, :integer, null: false
    end

    create index(:player_feedback, [:user_id])
    create index(:player_feedback, [:video_id])
  end
end
