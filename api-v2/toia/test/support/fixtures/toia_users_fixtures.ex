defmodule Toia.ToiaUsersFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.ToiaUsers` context.
  """

  @doc """
  Generate a toia_user.
  """
  def toia_user_fixture(attrs \\ %{}) do
    {:ok, toia_user} =
      attrs
      |> Enum.into(%{
        email: "some email",
        first_name: "some first_name",
        language: "some language",
        last_name: "some last_name",
        password: "some password"
      })
      |> Toia.ToiaUsers.create_toia_user()

    toia_user
  end
end
