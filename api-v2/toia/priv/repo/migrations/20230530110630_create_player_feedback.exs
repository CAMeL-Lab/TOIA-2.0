defmodule Toia.Repo.Migrations.CreatePlayerFeedback do
  use Ecto.Migration

  def change do
    create table(:player_feedback) do
      add :video_id, :string, null: false
      add :question, :text, null: false
      add :rating, :integer, null: false
      add :user_id, references(:toia_user, on_delete: :delete_all, type: :integer)
    end

    create index(:player_feedback, [:user_id])
  end
end
