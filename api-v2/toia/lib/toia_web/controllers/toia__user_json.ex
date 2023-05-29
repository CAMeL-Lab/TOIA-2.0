defmodule ToiaWeb.Toia_UserJSON do
  alias Toia.Accounts.Toia_User

  @doc """
  Renders a list of toia_users.
  """
  def index(%{toia_users: toia_users}) do
    %{data: for(toia__user <- toia_users, do: data(toia__user))}
  end

  @doc """
  Renders a single toia__user.
  """
  def show(%{toia__user: toia__user}) do
    %{data: data(toia__user)}
  end

  defp data(%Toia_User{} = toia__user) do
    %{
      id: toia__user.id,
      first_name: toia__user.first_name,
      last_name: toia__user.last_name,
      language: toia__user.language,
      email: toia__user.email,
      password: toia__user.password
    }
  end
end
