defmodule ToiaWeb.Toia_UserControllerTest do
  use ToiaWeb.ConnCase

  import Toia.AccountsFixtures

  alias Toia.Accounts.Toia_User

  @create_attrs %{
    email: "some email",
    first_name: "some first_name",
    language: "some language",
    last_name: "some last_name",
    password: "some password"
  }
  @update_attrs %{
    email: "some updated email",
    first_name: "some updated first_name",
    language: "some updated language",
    last_name: "some updated last_name",
    password: "some updated password"
  }
  @invalid_attrs %{email: nil, first_name: nil, language: nil, last_name: nil, password: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all toia_users", %{conn: conn} do
      conn = get(conn, ~p"/api/toia_users")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create toia__user" do
    test "renders toia__user when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/toia_users", toia__user: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/toia_users/#{id}")

      assert %{
               "id" => ^id,
               "email" => "some email",
               "first_name" => "some first_name",
               "language" => "some language",
               "last_name" => "some last_name",
               "password" => "some password"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/toia_users", toia__user: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update toia__user" do
    setup [:create_toia__user]

    test "renders toia__user when data is valid", %{conn: conn, toia__user: %Toia_User{id: id} = toia__user} do
      conn = put(conn, ~p"/api/toia_users/#{toia__user}", toia__user: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/toia_users/#{id}")

      assert %{
               "id" => ^id,
               "email" => "some updated email",
               "first_name" => "some updated first_name",
               "language" => "some updated language",
               "last_name" => "some updated last_name",
               "password" => "some updated password"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, toia__user: toia__user} do
      conn = put(conn, ~p"/api/toia_users/#{toia__user}", toia__user: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete toia__user" do
    setup [:create_toia__user]

    test "deletes chosen toia__user", %{conn: conn, toia__user: toia__user} do
      conn = delete(conn, ~p"/api/toia_users/#{toia__user}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/toia_users/#{toia__user}")
      end
    end
  end

  defp create_toia__user(_) do
    toia__user = toia__user_fixture()
    %{toia__user: toia__user}
  end
end
