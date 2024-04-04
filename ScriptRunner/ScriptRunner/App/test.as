
void Test(){
    Print << "Called 'Test'";

    Texture texture(Emoji("🧪"));

    while (System::Update()) {
        texture.drawAt(Scene::Center());
    }
}

void Main(){
    Print << "Called 'Main";

    Texture texture(Emoji("💘"));

    while (System::Update()) {
        texture.drawAt(Scene::Center());
    }
}
