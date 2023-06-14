defmodule Toia.ToiaUsers.ToiaUser do
  use Ecto.Schema
  import Ecto.Changeset

  schema "toia_user" do
    field :email, :string
    field :first_name, :string
    field :language, :string
    field :last_name, :string
    field :password, :string
  end

  @doc false
  def changeset(toia_user, attrs) do
    toia_user
    |> cast(attrs, [:first_name, :last_name, :language, :email, :password])
    |> validate_required([:first_name, :last_name, :language, :email, :password])
  end
end
