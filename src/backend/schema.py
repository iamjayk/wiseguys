import strawberry
from typing import Optional

from db import (
    get_all_titles,
    get_title_by_id,
    create_title as db_create_title,
    update_title as db_update_title,
    delete_title as db_delete_title,
    get_user_by_id,
    update_user as db_update_user,
)


@strawberry.type
class Title:
    id: int
    type: str
    name: str
    year: int
    year_end: Optional[int]
    description: Optional[str]
    poster_url: Optional[str]
    cast: list[str]


@strawberry.type
class User:
    id: int
    email: str
    display_name: str
    avatar_url: Optional[str]
    bio: Optional[str]
    created_at: str


@strawberry.input
class CreateTitleInput:
    type: str
    name: str
    year: int
    year_end: Optional[int] = None
    description: Optional[str] = None
    poster_url: Optional[str] = None
    cast: Optional[list[str]] = None


@strawberry.input
class UpdateTitleInput:
    type: Optional[str] = None
    name: Optional[str] = None
    year: Optional[int] = None
    year_end: Optional[int] = None
    description: Optional[str] = None
    poster_url: Optional[str] = None
    cast: Optional[list[str]] = None


@strawberry.input
class UpdateProfileInput:
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


def _user_to_graphql(row: dict) -> User:
    return User(
        id=row["id"],
        email=row["email"],
        display_name=row["display_name"],
        avatar_url=row.get("avatar_url"),
        bio=row.get("bio"),
        created_at=row["created_at"],
    )


@strawberry.type
class Query:
    @strawberry.field
    def titles(self, type: Optional[str] = None) -> list[Title]:
        rows = get_all_titles(type_filter=type)
        return [Title(**r) for r in rows]

    @strawberry.field
    def title(self, id: int) -> Optional[Title]:
        row = get_title_by_id(id)
        return Title(**row) if row else None

    @strawberry.field
    def me(self, info: strawberry.Info) -> Optional[User]:
        user_id = info.context.get("user_id")
        if not user_id:
            return None
        row = get_user_by_id(user_id)
        return _user_to_graphql(row) if row else None


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_title(self, info: strawberry.Info, input: CreateTitleInput) -> Title:
        row = db_create_title(
            type=input.type,
            name=input.name,
            year=input.year,
            year_end=input.year_end,
            description=input.description,
            poster_url=input.poster_url,
            cast=input.cast,
        )
        return Title(**row)

    @strawberry.mutation
    def update_title(
        self, info: strawberry.Info, id: int, input: UpdateTitleInput
    ) -> Optional[Title]:
        row = db_update_title(
            title_id=id,
            type=input.type,
            name=input.name,
            year=input.year,
            year_end=input.year_end,
            description=input.description,
            poster_url=input.poster_url,
            cast=input.cast,
        )
        return Title(**row) if row else None

    @strawberry.mutation
    def delete_title(self, info: strawberry.Info, id: int) -> bool:
        return db_delete_title(id)

    @strawberry.mutation
    def update_profile(
        self, info: strawberry.Info, input: UpdateProfileInput
    ) -> Optional[User]:
        user_id = info.context.get("user_id")
        if not user_id:
            return None
        row = db_update_user(
            user_id=user_id,
            display_name=input.display_name,
            avatar_url=input.avatar_url,
            bio=input.bio,
        )
        return _user_to_graphql(row) if row else None


schema = strawberry.Schema(query=Query, mutation=Mutation)
