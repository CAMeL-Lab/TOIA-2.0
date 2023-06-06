defmodule Toia.QuestionSuggestionsTest do
  use Toia.DataCase

  alias Toia.QuestionSuggestions

  describe "question_suggestions" do
    alias Toia.QuestionSuggestions.QuestionSuggestion

    import Toia.QuestionSuggestionsFixtures

    @invalid_attrs %{isPending: nil}

    test "list_question_suggestions/0 returns all question_suggestions" do
      question_suggestion = question_suggestion_fixture()
      assert QuestionSuggestions.list_question_suggestions() == [question_suggestion]
    end

    test "get_question_suggestion!/1 returns the question_suggestion with given id" do
      question_suggestion = question_suggestion_fixture()

      assert QuestionSuggestions.get_question_suggestion!(question_suggestion.id) ==
               question_suggestion
    end

    test "create_question_suggestion/1 with valid data creates a question_suggestion" do
      valid_attrs = %{isPending: true}

      assert {:ok, %QuestionSuggestion{} = question_suggestion} =
               QuestionSuggestions.create_question_suggestion(valid_attrs)

      assert question_suggestion.isPending == true
    end

    test "create_question_suggestion/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} =
               QuestionSuggestions.create_question_suggestion(@invalid_attrs)
    end

    test "update_question_suggestion/2 with valid data updates the question_suggestion" do
      question_suggestion = question_suggestion_fixture()
      update_attrs = %{isPending: false}

      assert {:ok, %QuestionSuggestion{} = question_suggestion} =
               QuestionSuggestions.update_question_suggestion(question_suggestion, update_attrs)

      assert question_suggestion.isPending == false
    end

    test "update_question_suggestion/2 with invalid data returns error changeset" do
      question_suggestion = question_suggestion_fixture()

      assert {:error, %Ecto.Changeset{}} =
               QuestionSuggestions.update_question_suggestion(question_suggestion, @invalid_attrs)

      assert question_suggestion ==
               QuestionSuggestions.get_question_suggestion!(question_suggestion.id)
    end

    test "delete_question_suggestion/1 deletes the question_suggestion" do
      question_suggestion = question_suggestion_fixture()

      assert {:ok, %QuestionSuggestion{}} =
               QuestionSuggestions.delete_question_suggestion(question_suggestion)

      assert_raise Ecto.NoResultsError, fn ->
        QuestionSuggestions.get_question_suggestion!(question_suggestion.id)
      end
    end

    test "change_question_suggestion/1 returns a question_suggestion changeset" do
      question_suggestion = question_suggestion_fixture()

      assert %Ecto.Changeset{} =
               QuestionSuggestions.change_question_suggestion(question_suggestion)
    end
  end
end
