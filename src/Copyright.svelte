<script lang="ts">
    export let owner: string = "";
    export let fromYear: string;

    function getYearRange(fYear: string): string {
        let nowYear = (new Date()).getFullYear();

        if (!fYear) {
            return nowYear.toString();
        } else if (+fYear >= nowYear) {
            return fYear;
        } else {
            return `${fYear}-${nowYear}`;
        }
    }

    $: yearRange = getYearRange(fromYear);
</script>

<style>
    .copyright {
        text-align: center;
    }

    .copyright small {
        font-size: 12px;
        color: gray;
    }
</style>

<div class="copyright">
    <small>Copyright &copy; {yearRange} {owner}. All rights reserved.</small>
</div>
