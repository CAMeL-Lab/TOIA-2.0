defmodule Toia.Accounts.Toia_User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "toia_users" do
    field :email, :string
    field :first_name, :string
    field :language, :string
    field :last_name, :string
    field :password, :string

    timestamps()
  end

  @doc false
  def changeset(toia__user, attrs) do
    toia__user
    |> cast(attrs, [:first_name, :last_name, :language, :email, :password])
    |> validate_required([:first_name, :last_name, :language, :email, :password])
  end
end
