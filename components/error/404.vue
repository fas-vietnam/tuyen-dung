<template>
	<div class="error-404">
		<div style="text-align: center">
			<h1>This page doesn’t exist</h1>
			<p>The link you clicked on may be broken or no longer exist.</p>
			<h1 class="red--text">このページは存在しません。</h1>
			<p class="brown--text">
				クリックしたリンクが壊れているか、存在しない可能性があります。
			</p>
		</div>
	</div>
</template>
<script>
export default {
	name: 'error-404',
	props: {
		error: {
			type: Object,
			default: () => {},
		},
	},
};
</script>
