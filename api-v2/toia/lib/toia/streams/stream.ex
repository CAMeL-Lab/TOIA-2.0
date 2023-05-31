defmodule Toia.Streams.Stream do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Phoenix.Param, key: :id_stream}
  @primary_key {:id_stream, :id, autogenerate: true}

  schema "stream" do
    field :likes, :integer
    field :name, :string
    field :private, :boolean, default: false
    field :views, :integer
    field :toia_id, :id
  end

  @doc false
  def changeset(stream, attrs) do
    stream
    |> cast(attrs, [:name, :private, :likes, :views, :toia_id])
    |> validate_required([:name, :private, :likes, :views, :toia_id])
  end
end
