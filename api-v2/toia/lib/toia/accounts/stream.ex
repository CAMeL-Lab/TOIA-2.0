defmodule Toia.Accounts.Stream do
  use Ecto.Schema
  import Ecto.Changeset

  schema "stream" do
    field :likes, :integer
    field :name, :string
    field :private, :boolean, default: false
    field :views, :integer
    field :toia_id, :id

    timestamps()
  end

  @doc false
  def changeset(stream, attrs) do
    stream
    |> cast(attrs, [:name, :private, :likes, :views])
    |> validate_required([:name, :private, :likes, :views])
  end
end
