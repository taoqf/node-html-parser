const { parse } = require('@test/test-target');

describe('funky attributes', function () {
	it('x-transition.duration.500ms', function () {
		const root = parse('<div x-transition.duration.500ms></div>');
		const div = root.firstChild;
		div.getAttribute('x-transition.duration.500ms').should.eql('');
		div.toString().should.eql('<div x-transition.duration.500ms></div>');
	});

	it('x-transition:enter.duration.500ms and x-transition:leave.duration.400ms', function () {
		const root = parse('<div x-transition:enter.duration.500ms x-transition:leave.duration.400ms></div>');
		const div = root.firstChild;
		div.getAttribute('x-transition:enter.duration.500ms').should.eql('');
		div.getAttribute('x-transition:leave.duration.400ms').should.eql('');
		div.toString().should.eql('<div x-transition:enter.duration.500ms x-transition:leave.duration.400ms></div>');
	});

	it('@click="open = ! open"', function () {
		const root = parse('<button @click="open = ! open">Toggle</button>');
		const div = root.firstChild;
		div.getAttribute('@click').should.eql('open = ! open');
		div.toString().should.eql('<button @click="open = ! open">Toggle</button>');
	});

	it('a bunch of stuff at the same time', function () {
		const root = parse(
			'<div x-show="open" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 scale-90" x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-300" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-90">Hello 👋</div>'
		);
		const div = root.firstChild;

		div.getAttribute('x-show').should.eql('open');
		div.getAttribute('x-transition:enter').should.eql('transition ease-out duration-300');
		div.getAttribute('x-transition:enter-start').should.eql('opacity-0 scale-90');
		div.getAttribute('x-transition:enter-end').should.eql('opacity-100 scale-100');
		div.getAttribute('x-transition:leave').should.eql('transition ease-in duration-300');
		div.getAttribute('x-transition:leave-start').should.eql('opacity-100 scale-100');
		div.getAttribute('x-transition:leave-end').should.eql('opacity-0 scale-90');

		div.toString().should.eql(
			'<div x-show="open" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 scale-90" x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-300" x-transition:leave-start="opacity-100 scale-100" x-transition:leave-end="opacity-0 scale-90">Hello 👋</div>'
		);
	});
});
