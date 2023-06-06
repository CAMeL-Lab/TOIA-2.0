defmodule Toia.Repo.Migrations.CreateStreamViewPermission do
  use Ecto.Migration

  def change do
    create table(:stream_view_permission, primary_key: false) do
      add :toia_id, references(:toia_user, on_delete: :delete_all, type: :serial),
        primary_key: true,
        null: false

      add :stream_id,
          references(:stream, on_delete: :delete_all, type: :serial, column: :id_stream),
          primary_key: true,
          null: false
    end

    create index(:stream_view_permission, [:stream_id])
    create unique_index(:stream_view_permission, [:toia_id, :stream_id])
  end
end
