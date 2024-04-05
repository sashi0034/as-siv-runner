#include <iso646.h>
#include <Siv3D.hpp>

namespace
{
	struct ScriptContext
	{
		FilePath scriptPath;
		String entryPoint;
		Script script;
		DirectoryWatcher watcher;
		bool initialized;
		bool missingEntryPoint;
		bool reloadRequested;
	};

	std::unique_ptr<ScriptContext> s_context{};

	void callEntryPoint(ScriptContext& ctx)
	{
		if (ctx.missingEntryPoint) return;

		const auto entryPoint = ctx.script.getFunction<void()>(ctx.entryPoint);
		if (not entryPoint)
		{
			ctx.missingEntryPoint = true;
			std::cout << "[Error] Entry point '" << ctx.entryPoint.narrow() << "' not found" << std::endl;
			return;
		}

		String exception;
		entryPoint.tryCall(exception);
		if (not exception.isEmpty())
		{
			std::cout << "[Error] " << exception.narrow() << std::endl;
		}
	}

	void reloadScript(ScriptContext& ctx)
	{
		ctx.initialized = true;
		ctx.missingEntryPoint = false;
		ctx.reloadRequested = false;

		std::cout << "--- Reload '" << ctx.scriptPath.narrow() << "'" << std::endl;

		if (ctx.script.reload())
		{
			std::cout << "OK" << std::endl;
		}
		else
		{
			std::cout << ctx.script.getMessages().join(U"\n", U"", U"").narrow() << std::endl;
		}

		ctx.watcher.clearChanges();
	}

	bool checkReloadRequest(ScriptContext& ctx)
	{
		const auto changes = ctx.watcher.retrieveChanges();
		if (changes.size() > 0 || not ctx.initialized)
		{
			ctx.reloadRequested = true;
			return true;
		}
		return false;
	}

	bool __cdecl scriptSystemUpdate()
	{
		if (s_context->reloadRequested) return false;
		if (checkReloadRequest(*s_context))return false;

		return true;
	}
}

void Main()
{
	const auto args = System::GetCommandLineArgs();
	if (args.size() != 2 && args.size() != 3)
	{
		std::cout << "[Usage] ScriptRunner <script file path> <entry point>" << std::endl;
		return;
	}

	const auto scriptPath = args[1];
	if (not FileSystem::Exists(scriptPath))
	{
		std::cout << "[Error] Script '" << scriptPath.narrow() << "' not found" << std::endl;
	}

	const auto entryPoint = args.size() >= 3 ? args[2] : U"Main";
	Window::SetTitle(U"OpenSiv3D Script Runner | {} | {}"_fmt(FileSystem::FileName(scriptPath), entryPoint));

	const auto scriptDirectory = FileSystem::ParentPath(scriptPath);
	FileSystem::ChangeCurrentDirectory(scriptDirectory);

	s_context = std::make_unique<ScriptContext>(ScriptContext{
		.scriptPath = scriptPath,
		.entryPoint = entryPoint,
		.script = Script(scriptPath),
		.watcher = DirectoryWatcher(scriptDirectory),
		.initialized = false,
		.missingEntryPoint = false,
		.reloadRequested = true,
	});

	s_context->script.setSystemUpdateCallback(scriptSystemUpdate);

	const Font font(FontMethod::SDF, 20, Typeface::Mplus_Regular);

	while (System::Update())
	{
		if (s_context->reloadRequested)
		{
			reloadScript(*s_context);
			callEntryPoint(*s_context);
		}
		else
		{
			(void)font(U"No script to run, see output in console.").drawAt(
				TextStyle::Outline(0.2, Palette::Gray), Scene::Center(), Palette::Whitesmoke);
		}

		checkReloadRequest(*s_context);
	}
}

//
// - Debug ビルド: プログラムの最適化を減らす代わりに、エラーやクラッシュ時に詳細な情報を得られます。
//
// - Release ビルド: 最大限の最適化でビルドします。
//
// - [デバッグ] メニュー → [デバッグの開始] でプログラムを実行すると、[出力] ウィンドウに詳細なログが表示され、エラーの原因を探せます。
//
// - Visual Studio を更新した直後は、プログラムのリビルド（[ビルド]メニュー → [ソリューションのリビルド]）が必要な場合があります。
//
