import { App, FuzzySuggestModal, KeymapEventListener } from "obsidian";
import ThemePicker from './main';
import { createPopper, Instance as PopperInstance } from "@popperjs/core";

export default class ThemePickerPluginModal extends FuzzySuggestModal<string> {
	DEFAULT_THEME_KEY = "";
	DEFAULT_THEME_TEXT = "None";
	plugin: ThemePicker;
	popper: PopperInstance;

	initialTheme: string;
	previewing = false;

	constructor(plugin: ThemePicker) {
		super(plugin.app);
		this.plugin = plugin;
		
		//@ts-ignore
		this.bgEl.setAttribute("style", "background-color: transparent");
		this.modalEl.classList.add("theme-picker-modal");

		// temporary styling to force a transparent modal background to address certain themes
		// that apply a background to the modal container instead of the modal-bg
		//@ts-ignore
    this.bgEl.parentElement.setAttribute("style", "background-color: transparent !important");
		//@ts-ignore
		this.bgEl.setAttribute("style", "backdrop-filter: none !important; background-color: transparent !important");

		//@ts-ignore
		const originalArrowUpEvent = this.scope.keys.find((key) => key.key === "ArrowUp");
		//@ts-ignore
		const originalArrowDownEvent = this.scope.keys.find((key) => key.key === "ArrowDown")

		const newFunction = function(originalFunc: KeymapEventListener, modal: ThemePickerPluginModal) {
			function newCallback(e: KeyboardEvent) {
				originalFunc(e, null);
				//@ts-ignore
				modal.setTheme(modal.chooser.values[modal.chooser.selectedItem].item);
				modal.previewing = true;
			}

			return newCallback;
		}

		originalArrowUpEvent.func = newFunction(originalArrowUpEvent.func, this);
		originalArrowDownEvent.func = newFunction(originalArrowDownEvent.func, this);
	}

	open(): void {
    (<any>this.app).keymap.pushScope(this.scope);
    document.body.appendChild(this.containerEl);
		this.popper = createPopper(document.body.querySelector(".status-bar > .plugin-theme-picker.theme-picker"), this.modalEl, {
			placement: "top-start",
			modifiers: [{ name: "offset", options: { offset: [0, 10] } }],
		});
    this.onOpen();
    (this.app.workspace as any).pushClosable(this);
  }

	onOpen() {
		super.onOpen();
		
		//@ts-ignore
		this.initialTheme = this.getItems().find(theme => theme === app.customCss.theme)
		//@ts-ignore
		this.chooser.setSelectedItem(this.getItems().findIndex(theme => theme === app.customCss.theme));
		//@ts-ignore
		this.chooser.suggestions[this.chooser.selectedItem].scrollIntoViewIfNeeded();
	}

	onClose() {
		super.onClose();
		if (this.previewing) {
			this.setTheme(this.initialTheme);
		}
	}

	getItems(): any[] {
		//@ts-ignore
		return [this.DEFAULT_THEME_KEY, ...this.app.customCss.themes];
	}

	getItemText(item: any): string {
		if (item === this.DEFAULT_THEME_KEY) {
			return this.DEFAULT_THEME_TEXT;
		} else {
			return item;
		}
	}

	onChooseItem(item: any, evt: MouseEvent | KeyboardEvent): void {
		this.previewing = false;
		this.setTheme(item);
	}

	setTheme(themeName: string) {
		//@ts-ignore
		this.app.customCss.setTheme(themeName);
		this.plugin.changeThemeButton.setText(themeName || "Default")
	}
}