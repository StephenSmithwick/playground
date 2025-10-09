from typing import Union

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/echo/{path}")
def read_item(path: str, q: Union[str, None] = None):
    return {"path": path, "q": q}
