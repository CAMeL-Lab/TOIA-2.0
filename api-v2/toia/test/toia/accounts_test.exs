defmodule Toia.AccountsTest do
  use Toia.DataCase

  alias Toia.Accounts

  describe "toia_users" do
    alias Toia.Accounts.Toia_User

    import Toia.AccountsFixtures

    @invalid_attrs %{email: nil, first_name: nil, language: nil, last_name: nil, password: nil}

    test "list_toia_users/0 returns all toia_users" do
      toia__user = toia__user_fixture()
      assert Accounts.list_toia_users() == [toia__user]
    end

    test "get_toia__user!/1 returns the toia__user with given id" do
      toia__user = toia__user_fixture()
      assert Accounts.get_toia__user!(toia__user.id) == toia__user
    end

    test "create_toia__user/1 with valid data creates a toia__user" do
      valid_attrs = %{email: "some email", first_name: "some first_name", language: "some language", last_name: "some last_name", password: "some password"}

      assert {:ok, %Toia_User{} = toia__user} = Accounts.create_toia__user(valid_attrs)
      assert toia__user.email == "some email"
      assert toia__user.first_name == "some first_name"
      assert toia__user.language == "some language"
      assert toia__user.last_name == "some last_name"
      assert toia__user.password == "some password"
    end

    test "create_toia__user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_toia__user(@invalid_attrs)
    end

    test "update_toia__user/2 with valid data updates the toia__user" do
      toia__user = toia__user_fixture()
      update_attrs = %{email: "some updated email", first_name: "some updated first_name", language: "some updated language", last_name: "some updated last_name", password: "some updated password"}

      assert {:ok, %Toia_User{} = toia__user} = Accounts.update_toia__user(toia__user, update_attrs)
      assert toia__user.email == "some updated email"
      assert toia__user.first_name == "some updated first_name"
      assert toia__user.language == "some updated language"
      assert toia__user.last_name == "some updated last_name"
      assert toia__user.password == "some updated password"
    end

    test "update_toia__user/2 with invalid data returns error changeset" do
      toia__user = toia__user_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_toia__user(toia__user, @invalid_attrs)
      assert toia__user == Accounts.get_toia__user!(toia__user.id)
    end

    test "delete_toia__user/1 deletes the toia__user" do
      toia__user = toia__user_fixture()
      assert {:ok, %Toia_User{}} = Accounts.delete_toia__user(toia__user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_toia__user!(toia__user.id) end
    end

    test "change_toia__user/1 returns a toia__user changeset" do
      toia__user = toia__user_fixture()
      assert %Ecto.Changeset{} = Accounts.change_toia__user(toia__user)
    end
  end
end
