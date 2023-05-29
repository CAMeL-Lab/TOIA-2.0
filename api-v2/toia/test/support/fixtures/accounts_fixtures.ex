defmodule Toia.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.Accounts` context.
  """

  @doc """
  Generate a toia__user.
  """
  def toia__user_fixture(attrs \\ %{}) do
    {:ok, toia__user} =
      attrs
      |> Enum.into(%{
        email: "some email",
        first_name: "some first_name",
        language: "some language",
        last_name: "some last_name",
        password: "some password"
      })
      |> Toia.Accounts.create_toia__user()

    toia__user
  end
end
