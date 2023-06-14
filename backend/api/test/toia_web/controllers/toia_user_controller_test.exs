defmodule ToiaWeb.ToiaUserControllerTest do
  use ToiaWeb.ConnCase

  import Toia.ToiaUsersFixtures

  alias Toia.ToiaUsers.ToiaUser

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
    test "lists all toia_user", %{conn: conn} do
      conn = get(conn, ~p"/api/toia_user")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create toia_user" do
    test "renders toia_user when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/toia_user", toia_user: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/toia_user/#{id}")

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
      conn = post(conn, ~p"/api/toia_user", toia_user: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update toia_user" do
    setup [:create_toia_user]

    test "renders toia_user when data is valid", %{
      conn: conn,
      toia_user: %ToiaUser{id: id} = toia_user
    } do
      conn = put(conn, ~p"/api/toia_user/#{toia_user}", toia_user: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/toia_user/#{id}")

      assert %{
               "id" => ^id,
               "email" => "some updated email",
               "first_name" => "some updated first_name",
               "language" => "some updated language",
               "last_name" => "some updated last_name",
               "password" => "some updated password"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, toia_user: toia_user} do
      conn = put(conn, ~p"/api/toia_user/#{toia_user}", toia_user: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete toia_user" do
    setup [:create_toia_user]

    test "deletes chosen toia_user", %{conn: conn, toia_user: toia_user} do
      conn = delete(conn, ~p"/api/toia_user/#{toia_user}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/toia_user/#{toia_user}")
      end
    end
  end

  defp create_toia_user(_) do
    toia_user = toia_user_fixture()
    %{toia_user: toia_user}
  end
end
