defmodule ToiaWeb.ToiaUserJSON do
  alias Toia.ToiaUsers.ToiaUser

  @doc """
  Renders a list of toia_user.
  """
  def index(%{toia_user: toia_user}) do
    %{data: for(toia_user <- toia_user, do: data(toia_user))}
  end

  @doc """
  Renders a single toia_user.
  """
  def show(%{toia_user: toia_user, token: token}) do
    %{data: data(toia_user), token: token}
  end

  def show(%{toia_user: toia_user}) do
    %{data: data(toia_user)}
  end


  defp data(%ToiaUser{} = toia_user) do
    %{
      id: toia_user.id,
      first_name: toia_user.first_name,
      last_name: toia_user.last_name,
      language: toia_user.language,
      email: toia_user.email,
    }
  end
end
