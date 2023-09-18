defmodule Toia.Repo.Migrations.CreateTracker do
  use Ecto.Migration

  def change do
    create table(:tracker, primary_key: false) do
      add :track_id, :serial, null: false, primary_key: true
      add :user_id, references(:toia_user, on_delete: :delete_all, type: :serial), null: false
      add :activity, :string, null: false
      add :start_time, :bigint, null: false
      add :end_time, :bigint, default: nil
      add :video_id, :string, default: nil
      add :old_video_id, :string, default: nil
    end

    create unique_index(:tracker, [:track_id])
  end
end
